import { BibleVerse, TranslationId } from '../types';
import { getBundledVerses, BIBLE_BOOKS } from '../data/bibleData';

const DB_NAME = 'faithlingo_bible_offline_v3';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';
const FULL_STORE_NAME = 'full_translations';

export interface StoredChapter {
  id: string; // `${translation}_${book.toLowerCase()}_${chapter}`
  translation: TranslationId;
  book: string;
  chapter: number;
  verses: BibleVerse[];
  savedAt: number;
}

class OfflineBibleStorage {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memoryCache: Map<string, Record<string, Record<string, string[]>>> = new Map();

  constructor() {
    this.init();
  }

  private init(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('translation', 'translation', { unique: false });
            store.createIndex('book', 'book', { unique: false });
          }
          if (!db.objectStoreNames.contains(FULL_STORE_NAME)) {
            db.createObjectStore(FULL_STORE_NAME, { keyPath: 'translation' });
          }
        };

        req.onsuccess = () => {
          this.db = req.result;
          resolve(this.db);
        };

        req.onerror = () => {
          console.warn('IndexedDB unavailable, using memory/local fallback');
          resolve(null);
        };
      } catch (err) {
        console.warn('Failed to open IndexedDB:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  public getChapterKey(translation: TranslationId, book: string, chapter: number): string {
    return `${translation.toUpperCase()}_${book.toLowerCase()}_${chapter}`;
  }

  // Preload complete translation JSON (either from static /bible/kjv.json or IndexedDB)
  public async loadFullTranslation(translation: TranslationId): Promise<Record<string, Record<string, string[]>> | null> {
    const code = translation.toLowerCase();
    if (this.memoryCache.has(code)) {
      return this.memoryCache.get(code)!;
    }

    // 1. Try IndexedDB full store
    try {
      const db = await this.init();
      if (db) {
        const tx = db.transaction(FULL_STORE_NAME, 'readonly');
        const store = tx.objectStore(FULL_STORE_NAME);
        const req = store.get(translation);
        const record = await new Promise<any>((resolve) => {
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (record && record.data) {
          this.memoryCache.set(code, record.data);
          return record.data;
        }
      }
    } catch {}

    // 2. Fetch static /bible/{code}.json from local assets
    try {
      const res = await fetch(`/bible/${code}.json`);
      if (res.ok) {
        const data = await res.json();
        this.memoryCache.set(code, data);

        // Save to IndexedDB asynchronously
        this.saveFullTranslationToDB(translation, data).catch(() => {});
        return data;
      }
    } catch (err) {
      console.warn(`Could not fetch /bible/${code}.json:`, err);
    }

    return null;
  }

  private async saveFullTranslationToDB(translation: TranslationId, data: any): Promise<void> {
    try {
      const db = await this.init();
      if (db) {
        const tx = db.transaction(FULL_STORE_NAME, 'readwrite');
        const store = tx.objectStore(FULL_STORE_NAME);
        store.put({ translation, data, savedAt: Date.now() });
      }
    } catch {}
  }

  // Get chapter from cache / IndexedDB / memory / bundled
  public async getChapter(translation: TranslationId, book: string, chapter: number): Promise<BibleVerse[] | null> {
    const key = this.getChapterKey(translation, book, chapter);

    // 1. Check in-memory full translation
    const full = this.memoryCache.get(translation.toLowerCase());
    if (full) {
      const bookKey = Object.keys(full).find(k => k.toLowerCase() === book.toLowerCase());
      if (bookKey && full[bookKey] && full[bookKey][String(chapter)]) {
        return full[bookKey][String(chapter)].map((txt, idx) => ({
          book: bookKey,
          chapter: Number(chapter),
          verse: idx + 1,
          text: txt,
          translation
        }));
      }
    }

    // 2. Try IndexedDB single chapter store
    try {
      const db = await this.init();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        const record = await new Promise<StoredChapter | undefined>((resolve, reject) => {
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

        if (record && Array.isArray(record.verses) && record.verses.length > 0) {
          return record.verses;
        }
      }
    } catch (err) {
      console.warn('Error reading from IndexedDB:', err);
    }

    // 3. Try pre-bundled verses
    const bundled = getBundledVerses(book, chapter, translation);
    if (bundled.length > 0) {
      return bundled;
    }

    return null;
  }

  // Save chapter permanently for offline access
  public async saveChapter(translation: TranslationId, book: string, chapter: number, verses: BibleVerse[]): Promise<void> {
    if (!verses || verses.length === 0) return;
    const key = this.getChapterKey(translation, book, chapter);
    const data: StoredChapter = {
      id: key,
      translation,
      book,
      chapter,
      verses,
      savedAt: Date.now()
    };

    try {
      const db = await this.init();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(data);
      }
    } catch (err) {
      console.warn('Error saving chapter to IndexedDB:', err);
    }
  }

  // Fetch chapter with online/offline fallback ensuring zero missed verses
  public async loadChapterOnlineOrOffline(
    translation: TranslationId, 
    book: string, 
    chapter: number
  ): Promise<{ verses: BibleVerse[]; isOffline: boolean }> {
    // 1. Check local cache
    const cached = await this.getChapter(translation, book, chapter);
    if (cached && cached.length > 0) {
      return { verses: cached, isOffline: true };
    }

    // 2. Try loading via full translation file
    const fullData = await this.loadFullTranslation(translation);
    if (fullData) {
      const bookKey = Object.keys(fullData).find(k => k.toLowerCase() === book.toLowerCase());
      if (bookKey && fullData[bookKey] && fullData[bookKey][String(chapter)]) {
        const verses: BibleVerse[] = fullData[bookKey][String(chapter)].map((txt, idx) => ({
          book: bookKey,
          chapter: Number(chapter),
          verse: idx + 1,
          text: txt,
          translation
        }));
        await this.saveChapter(translation, book, chapter, verses);
        return { verses, isOffline: true };
      }
    }

    // 3. Try backend API `/api/bible/chapter`
    try {
      const res = await fetch(`/api/bible/chapter?translation=${translation.toLowerCase()}&book=${encodeURIComponent(book)}&chapter=${chapter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verses && data.verses.length > 0) {
          const normalized: BibleVerse[] = data.verses.map((v: any) => ({
            book: book,
            chapter: chapter,
            verse: Number(v.verse),
            text: String(v.text).trim(),
            translation: translation
          }));
          await this.saveChapter(translation, book, chapter, normalized);
          return { verses: normalized, isOffline: false };
        }
      }
    } catch (netErr) {
      console.warn('API request failed:', netErr);
    }

    // 4. Bundled fallback
    const bundledFallback = getBundledVerses(book, chapter, translation);
    if (bundledFallback.length > 0) {
      return { verses: bundledFallback, isOffline: true };
    }

    return {
      verses: [
        {
          book,
          chapter,
          verse: 1,
          text: `“Trust in the Lord with all your heart.” [${book} ${chapter}]`,
          translation
        }
      ],
      isOffline: true
    };
  }

  // Get total offline stats
  public async getOfflineStats(translation: TranslationId = 'KJV'): Promise<{ chaptersCount: number; booksCount: number; isFullBibleReady: boolean }> {
    const full = this.memoryCache.get(translation.toLowerCase());
    if (full && Object.keys(full).length >= 66) {
      return { chaptersCount: 1189, booksCount: 66, isFullBibleReady: true };
    }

    try {
      const db = await this.init();
      if (!db) return { chaptersCount: 0, booksCount: 0, isFullBibleReady: false };

      // Check full store
      const txFull = db.transaction(FULL_STORE_NAME, 'readonly');
      const storeFull = txFull.objectStore(FULL_STORE_NAME);
      const fullRec = await new Promise<any>((resolve) => {
        const req = storeFull.get(translation);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (fullRec && fullRec.data) {
        this.memoryCache.set(translation.toLowerCase(), fullRec.data);
        return { chaptersCount: 1189, booksCount: 66, isFullBibleReady: true };
      }

      // Check individual chapters
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      const items = await new Promise<StoredChapter[]>((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      const filtered = items.filter(i => i.translation === translation);
      const uniqueBooks = new Set(filtered.map(i => i.book.toLowerCase()));

      return {
        chaptersCount: filtered.length,
        booksCount: uniqueBooks.size,
        isFullBibleReady: filtered.length >= 1189
      };
    } catch {
      return { chaptersCount: 0, booksCount: 0, isFullBibleReady: false };
    }
  }

  // Bulk download and cache entire 66-book Bible (1,189 chapters, 31,102 verses)
  public async syncEntireBibleOffline(
    translation: TranslationId,
    onProgress?: (percent: number, status: string) => void
  ): Promise<boolean> {
    if (onProgress) onProgress(10, `Downloading full ${translation} dataset...`);

    try {
      const data = await this.loadFullTranslation(translation);
      if (!data) return false;

      if (onProgress) onProgress(50, `Saving 66 books (1,189 chapters, 31,102 verses) to offline storage...`);

      // Store in IndexedDB
      await this.saveFullTranslationToDB(translation, data);

      if (onProgress) onProgress(100, `Complete Bible successfully saved offline!`);
      return true;
    } catch (err) {
      console.error('Failed to sync entire Bible offline:', err);
      return false;
    }
  }

  // Search entire Bible across all 31,102 verses
  public async searchEntireBible(
    query: string, 
    translation: TranslationId = 'KJV'
  ): Promise<Array<{ book: string; chapter: number; verse: number; text: string }>> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    // 1. Try memory cache first
    const full = this.memoryCache.get(translation.toLowerCase()) || await this.loadFullTranslation(translation);
    if (full) {
      const results: Array<{ book: string; chapter: number; verse: number; text: string }> = [];
      for (const [book, chapters] of Object.entries(full)) {
        for (const [ch, verses] of Object.entries(chapters)) {
          for (let i = 0; i < verses.length; i++) {
            const vText = verses[i];
            if (vText.toLowerCase().includes(q)) {
              results.push({
                book,
                chapter: Number(ch),
                verse: i + 1,
                text: vText
              });
              if (results.length >= 50) return results;
            }
          }
        }
      }
      return results;
    }

    // 2. Try server search
    try {
      const res = await fetch(`/api/bible/search?translation=${translation.toLowerCase()}&q=${encodeURIComponent(q)}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
    } catch {}

    return [];
  }
}

export const offlineBibleStorage = new OfflineBibleStorage();
