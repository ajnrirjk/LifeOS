import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry, PhotoAttachment, JournalTheme } from '../../types/journal';
import { EncryptedBackupModal } from './EncryptedBackupModal';
import { googleDriveService } from '../../services/googleDriveService';
import { User } from 'firebase/auth';
import { 
  Plus, 
  Trash2, 
  Search, 
  Camera, 
  ShieldCheck, 
  Calendar, 
  Moon, 
  Sun, 
  Check, 
  Volume2, 
  BookOpen, 
  User as UserIcon, 
  Copy, 
  Image as ImageIcon,
  Quote,
  List,
  Heart,
  AlertTriangle,
  FileText,
  ExternalLink,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogOut,
  ChevronDown,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  X,
  Sliders,
  Radio
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';
import { tts } from '../../services/ttsService';

export const BibleJournalApp: React.FC = () => {
  // Start with empty notes so the user can add their own
  const [notes, setNotes] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('lifeos_church_sermon_notes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Current active note ID
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('lifeos_church_sermon_notes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Google Drive Authentication & Sync state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isSigningInDrive, setIsSigningInDrive] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);
  const [driveSyncStatus, setDriveSyncStatus] = useState<string | null>(null);
  const [isDriveMenuOpen, setIsDriveMenuOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Theme
  const [theme, setTheme] = useState<JournalTheme>(() => {
    try {
      return (localStorage.getItem('lifeos_journal_theme') as JournalTheme) || 'parchment';
    } catch {
      return 'parchment';
    }
  });

  // UI States
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved');
  const [activePhotoLightbox, setActivePhotoLightbox] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<JournalEntry | null>(null);

  // High-Sensitivity Audio & Dictation State
  const [isDictating, setIsDictating] = useState(false);
  const [isSummarizingVoice, setIsSummarizingVoice] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [dictationBuffer, setDictationBuffer] = useState('');
  const [dictationSeconds, setDictationSeconds] = useState(0);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [micSensitivity, setMicSensitivity] = useState<'high' | 'ultra' | 'normal'>('high');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const accumulatedTextRef = useRef<string>('');
  const finalizedPhrasesRef = useRef<string[]>([]);
  const interimTranscriptRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<any>(null);
  const lastResultTimestampRef = useRef<number>(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Dictation timer
  useEffect(() => {
    let interval: any = null;
    if (isDictating) {
      interval = setInterval(() => {
        setDictationSeconds(s => s + 1);
      }, 1000);
    } else {
      setDictationSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isDictating]);

  // Active note object
  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  // Auto-backup recorded sermon buffer to localStorage every 10 seconds during long sessions
  useEffect(() => {
    if (!isDictating) return;
    const saveInterval = setInterval(() => {
      const text = (finalizedPhrasesRef.current.join(' ') + ' ' + interimTranscriptRef.current).trim();
      if (text && text.length > 20) {
        try {
          localStorage.setItem('lifeos_sermon_transcript_checkpoint', JSON.stringify({
            noteId: activeNote?.id,
            transcript: text,
            seconds: dictationSeconds,
            updatedAt: new Date().toISOString()
          }));
        } catch {}
      }
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [isDictating, dictationSeconds, activeNote?.id]);

  // Watchdog heartbeat: if speech recognition becomes idle/stalled for >14s while listening, automatically spawn a fresh instance
  useEffect(() => {
    if (!isDictating) return;
    const watchdog = setInterval(() => {
      if (!isListeningRef.current) return;
      const idleTime = Date.now() - lastResultTimestampRef.current;
      if (idleTime > 14000) {
        lastResultTimestampRef.current = Date.now();
        spawnRecognitionInstance();
      }
    }, 4000);
    return () => clearInterval(watchdog);
  }, [isDictating]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = googleDriveService.initAuth(
      (user) => {
        setGoogleUser(user);
        setDriveSyncStatus('Connected to Google Drive');
      },
      () => {
        setGoogleUser(null);
        setDriveSyncStatus(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Auto-save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_church_sermon_notes_v2', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Save theme
  useEffect(() => {
    try {
      localStorage.setItem('lifeos_journal_theme', theme);
    } catch {}
  }, [theme]);

  // Update field of active note
  const updateActiveNote = (fields: Partial<JournalEntry>) => {
    if (!activeNote) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(`Saved at ${timeStr}`);

    setNotes(prev => prev.map(note => {
      if (note.id === activeNote.id) {
        return {
          ...note,
          ...fields,
          updatedAt: now.toISOString()
        };
      }
      return note;
    }));
  };

  // Auto-save to Google Drive when connected
  useEffect(() => {
    if (!googleUser || !activeNote) return;
    // Don't auto-save empty new notes until there's some content or title
    if (!activeNote.title?.trim() && !activeNote.content?.trim()) return;

    const timer = setTimeout(async () => {
      try {
        setIsDriveSyncing(true);
        setDriveSyncStatus('Saving to Drive...');
        const result = await googleDriveService.saveNoteToDrive(activeNote);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setNotes(prev => prev.map(n => n.id === activeNote.id ? {
          ...n,
          driveFileId: result.fileId,
          driveWebViewLink: result.webViewLink || n.driveWebViewLink,
          lastDriveSync: new Date().toISOString()
        } : n));

        setDriveSyncStatus(`Saved to Google Drive (${timeStr})`);
      } catch (err: any) {
        console.error('Google Drive auto-save error:', err);
        setDriveSyncStatus('Drive auto-save error');
      } finally {
        setIsDriveSyncing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    activeNote?.id,
    activeNote?.title,
    activeNote?.content,
    activeNote?.speaker,
    activeNote?.passage,
    activeNote?.date,
    activeNote?.tags,
    googleUser
  ]);

  // Handle Google Drive Connect
  const handleConnectDrive = async () => {
    sounds.playTap();
    setIsSigningInDrive(true);
    try {
      const { user } = await googleDriveService.signIn();
      setGoogleUser(user);
      sounds.playVictory();
      setDriveSyncStatus('Connected to Google Drive');

      // If active note exists, immediately save it to Drive
      if (activeNote && (activeNote.title || activeNote.content)) {
        setIsDriveSyncing(true);
        const res = await googleDriveService.saveNoteToDrive(activeNote);
        setNotes(prev => prev.map(n => n.id === activeNote.id ? {
          ...n,
          driveFileId: res.fileId,
          driveWebViewLink: res.webViewLink
        } : n));
        setIsDriveSyncing(false);
      }
    } catch (err: any) {
      sounds.playIncorrect();
      console.error('Google Drive sign in failed:', err);
    } finally {
      setIsSigningInDrive(false);
    }
  };

  // Disconnect Google Drive
  const handleDisconnectDrive = async () => {
    sounds.playTap();
    await googleDriveService.signOutUser();
    setGoogleUser(null);
    setDriveSyncStatus(null);
    setIsDriveMenuOpen(false);
  };

  // Manual Full Sync All to Google Drive
  const handleSyncAllToDrive = async () => {
    if (!googleUser) return;
    sounds.playTap();
    setIsDriveSyncing(true);
    setDriveSyncStatus('Syncing all notes to Drive...');
    try {
      await googleDriveService.saveMasterBackupToDrive(notes);
      for (const note of notes) {
        if (note.title || note.content) {
          const res = await googleDriveService.saveNoteToDrive(note);
          setNotes(prev => prev.map(n => n.id === note.id ? {
            ...n,
            driveFileId: res.fileId,
            driveWebViewLink: res.webViewLink
          } : n));
        }
      }
      sounds.playVictory();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDriveSyncStatus(`All notes synced to Google Drive (${timeStr})`);
    } catch (err) {
      sounds.playIncorrect();
      setDriveSyncStatus('Sync all failed');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // Create a brand new sermon note
  const handleCreateNewNote = () => {
    sounds.playTap();
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedDate = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()} • Church Service`;

    const newNote: JournalEntry = {
      id: `sermon_${Date.now()}`,
      title: '',
      speaker: '',
      passage: '',
      date: formattedDate,
      content: '',
      tags: ['SundaySermon'],
      photos: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setIsMobileSidebarOpen(false);

    // Auto-focus title input after state settles
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  // Confirm delete note (with explicit confirmation for local + Drive)
  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    sounds.playTap();

    // If file is on Google Drive, also remove it from Drive
    if (noteToDelete.driveFileId && googleUser) {
      try {
        await googleDriveService.deleteNoteFromDrive(noteToDelete.driveFileId);
      } catch (err) {
        console.error('Failed to delete from Drive:', err);
      }
    }

    const remaining = notes.filter(n => n.id !== noteToDelete.id);
    setNotes(remaining);
    if (activeNoteId === noteToDelete.id) {
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
    setNoteToDelete(null);
  };

  // Quick insertion helpers for sermon note-taking
  const insertTextAtCursor = (prefix: string) => {
    sounds.playTap();
    if (!activeNote) return;
    const current = activeNote.content || '';
    const updated = current ? `${current}\n\n${prefix}` : prefix;
    updateActiveNote({ content: updated });
  };

  // Format elapsed time as mm:ss
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Stop & Clean/Summarize Dictation
  const handleStopAndSummarize = async () => {
    isListeningRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    setAudioLevel(0);
    setIsDictating(false);

    // Compile entire transcript from all phrases plus any pending interim words
    const allPhrases = [...finalizedPhrasesRef.current];
    if (interimTranscriptRef.current && interimTranscriptRef.current.trim()) {
      allPhrases.push(interimTranscriptRef.current.trim());
    }
    const fullText = allPhrases.join(' ').trim();

    finalizedPhrasesRef.current = [];
    accumulatedTextRef.current = '';
    interimTranscriptRef.current = '';
    setInterimTranscript('');
    setDictationBuffer('');

    // Clear saved checkpoint
    try {
      localStorage.removeItem('lifeos_sermon_transcript_checkpoint');
    } catch {}

    if (!fullText) {
      setSpeechNotice('No sermon speech was detected to summarize. Tap "Listen to Sermon" and speak.');
      setTimeout(() => setSpeechNotice(null), 5000);
      return;
    }

    setIsSummarizingVoice(true);
    try {
      const res = await fetch('/api/sermon/summarize-dictation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: fullText,
          currentNotes: activeNote?.content || '',
          noteTitle: activeNote?.title || '',
          notePassage: activeNote?.passage || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updates: Partial<JournalEntry> = {};

        // Auto-fill title, passage, speaker if discovered from sermon speech and empty
        if (data.detectedTitle && (!activeNote?.title || activeNote.title.toLowerCase().includes('untitled'))) {
          updates.title = data.detectedTitle;
        }
        if (data.detectedPassage && !activeNote?.passage) {
          updates.passage = data.detectedPassage;
        }
        if (data.detectedSpeaker && !activeNote?.speaker) {
          updates.speaker = data.detectedSpeaker;
        }

        const summaryText = (data.summary && data.summary.trim()) ? data.summary.trim() : `### 📖 Sermon Reflection\n\n${fullText}`;
        sounds.playVictory();
        const current = activeNote?.content || '';
        updates.content = current ? `${current}\n\n${summaryText}` : summaryText;
        updateActiveNote(updates);
      } else {
        sounds.playVictory();
        const current = activeNote?.content || '';
        const fallback = `### 📖 Sermon Reflection\n\n${fullText}`;
        updateActiveNote({ content: current ? `${current}\n\n${fallback}` : fallback });
      }
    } catch (err) {
      console.error('Dictation summarization error:', err);
      sounds.playTap();
      const current = activeNote?.content || '';
      const fallback = `### 📖 Sermon Reflection\n\n${fullText}`;
      updateActiveNote({ content: current ? `${current}\n\n${fallback}` : fallback });
    } finally {
      setIsSummarizingVoice(false);
    }
  };

  // Toggle microphone sensitivity preset
  const toggleSensitivity = () => {
    sounds.playTap();
    const next = micSensitivity === 'normal' ? 'high' : micSensitivity === 'high' ? 'ultra' : 'normal';
    setMicSensitivity(next);
  };

  // Schedule a clean fresh SpeechRecognition restart with 350ms delay for Chrome to release mic
  const scheduleRestart = () => {
    if (!isListeningRef.current) return;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    restartTimeoutRef.current = setTimeout(() => {
      if (isListeningRef.current) {
        spawnRecognitionInstance();
      }
    }, 350);
  };

  // Spawns a brand-new SpeechRecognition instance (prevents Chromium deadlocks after silence/timeouts)
  const spawnRecognitionInstance = () => {
    if (!isListeningRef.current) return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    // Destroy old dead instance cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (!isListeningRef.current) {
          try { recognition.abort(); } catch {}
          return;
        }
        setIsDictating(true);
        setSpeechNotice(null);
        lastResultTimestampRef.current = Date.now();
        setAudioLevel(30);
      };

      recognition.onresult = (event: any) => {
        lastResultTimestampRef.current = Date.now();
        // Reactive sound visualizer animation
        setAudioLevel(Math.floor(Math.random() * 45) + 50);
        setTimeout(() => {
          if (isListeningRef.current) setAudioLevel(20);
        }, 250);

        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const phrase = item[0].transcript.trim();
            if (item.isFinal) {
              if (phrase) {
                finalizedPhrasesRef.current.push(phrase);
              }
            } else {
              currentInterim += ' ' + item[0].transcript;
            }
          }
        }

        interimTranscriptRef.current = currentInterim.trim();
        setInterimTranscript(currentInterim.trim());

        const fullSpoken = (finalizedPhrasesRef.current.join(' ') + (currentInterim ? ' ' + currentInterim : '')).trim();
        accumulatedTextRef.current = fullSpoken;
        setDictationBuffer(fullSpoken);
      };

      recognition.onerror = (event: any) => {
        console.log('SpeechRecognition notice:', event.error);
        if (event.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsDictating(false);
          setSpeechNotice('Microphone access was denied. Please allow microphone permissions in browser.');
          setTimeout(() => setSpeechNotice(null), 6000);
          return;
        }
        // Auto-restart on timeouts or no-speech without dropping the session
        if (isListeningRef.current) {
          scheduleRestart();
        }
      };

      recognition.onend = () => {
        // Chromium ends every ~30-60s or on silence.
        // Flush any lingering interim text and immediately spawn a fresh instance so it NEVER stops listening!
        if (isListeningRef.current) {
          if (interimTranscriptRef.current && interimTranscriptRef.current.trim()) {
            finalizedPhrasesRef.current.push(interimTranscriptRef.current.trim());
            interimTranscriptRef.current = '';
            setInterimTranscript('');
            const fullSpoken = finalizedPhrasesRef.current.join(' ');
            accumulatedTextRef.current = fullSpoken;
            setDictationBuffer(fullSpoken);
          }
          scheduleRestart();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Spawn error, rescheduling in 350ms:', err);
      if (isListeningRef.current) {
        scheduleRestart();
      }
    }
  };

  // Toggle Speech Recognition API (with continuous listening across silences and high sensitivity)
  const handleToggleDictation = () => {
    sounds.playTap();
    if (isDictating) {
      handleStopAndSummarize();
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSpeechNotice('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      setTimeout(() => setSpeechNotice(null), 6000);
      return;
    }

    finalizedPhrasesRef.current = [];
    accumulatedTextRef.current = '';
    interimTranscriptRef.current = '';
    setInterimTranscript('');
    setDictationBuffer('');
    isListeningRef.current = true;
    lastResultTimestampRef.current = Date.now();

    // Spawn first active recognition instance
    spawnRecognitionInstance();
  };

  // Cancel Dictation without inserting
  const handleCancelDictation = () => {
    sounds.playTap();
    isListeningRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    setAudioLevel(0);
    setIsDictating(false);
    setIsSummarizingVoice(false);
    finalizedPhrasesRef.current = [];
    interimTranscriptRef.current = '';
    setInterimTranscript('');
    accumulatedTextRef.current = '';
    setDictationBuffer('');

    try {
      localStorage.removeItem('lifeos_sermon_transcript_checkpoint');
    } catch {}
  };

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Copy sermon notes to clipboard
  const handleCopyNotes = () => {
    sounds.playTap();
    if (!activeNote) return;
    const text = `📖 ${activeNote.title || 'Sermon Note'}\nPreacher: ${activeNote.speaker || 'Church'}\nScripture: ${activeNote.passage || 'N/A'}\nDate: ${activeNote.date}\n\n${activeNote.content}`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Read aloud sermon notes
  const handleAudioListen = () => {
    sounds.playTap();
    if (!activeNote) return;
    tts.speak(`${activeNote.title || 'Sermon Note'}. ${activeNote.passage ? `Scripture: ${activeNote.passage}.` : ''} ${activeNote.content}`);
  };

  // Photo attachment upload (sermon slide / bulletin)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeNote) return;

    sounds.playTap();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newPhoto: PhotoAttachment = {
        id: `photo_${Date.now()}`,
        dataUrl,
        caption: 'Sermon photo',
        dateAdded: new Date().toISOString()
      };
      const existingPhotos = activeNote.photos || [];
      updateActiveNote({ photos: [...existingPhotos, newPhoto] });
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = (photoId: string) => {
    if (!activeNote) return;
    sounds.playTap();
    const updatedPhotos = (activeNote.photos || []).filter(p => p.id !== photoId);
    updateActiveNote({ photos: updatedPhotos });
  };

  // Filtered notes
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));
  const filteredNotes = notes.filter(n => {
    const matchesTag = selectedTag === 'all' || (n.tags && n.tags.includes(selectedTag));
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      n.title.toLowerCase().includes(q) ||
      (n.speaker && n.speaker.toLowerCase().includes(q)) ||
      (n.passage && n.passage.toLowerCase().includes(q)) ||
      n.content.toLowerCase().includes(q) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)));
    return matchesTag && matchesSearch;
  });

  // Theme styles
  const themeClasses = {
    parchment: {
      bg: 'bg-[#faf8f4] text-stone-900',
      sidebar: 'bg-[#f4efe6] border-[#e6ddd0]',
      editorBg: 'bg-white',
      noteItemActive: 'bg-white shadow-sm border-amber-600/40 ring-1 ring-amber-600/20',
      noteItem: 'hover:bg-white/60 border-transparent',
      inputBorder: 'border-stone-200 focus:border-amber-600',
      badge: 'bg-amber-100 text-amber-800',
    },
    midnight: {
      bg: 'bg-slate-950 text-slate-100',
      sidebar: 'bg-slate-900 border-slate-800',
      editorBg: 'bg-slate-900/90',
      noteItemActive: 'bg-slate-800 shadow-sm border-emerald-500/50 ring-1 ring-emerald-500/30',
      noteItem: 'hover:bg-slate-800/50 border-transparent',
      inputBorder: 'border-slate-800 focus:border-emerald-500',
      badge: 'bg-emerald-950 text-emerald-300',
    },
    sepia: {
      bg: 'bg-[#fbf4e6] text-[#3e2e28]',
      sidebar: 'bg-[#f2e6d2] border-[#e2d2bb]',
      editorBg: 'bg-[#fffaf0]',
      noteItemActive: 'bg-[#fffaf0] shadow-sm border-[#8c624f]/50 ring-1 ring-[#8c624f]/20',
      noteItem: 'hover:bg-[#fffaf0]/60 border-transparent',
      inputBorder: 'border-[#dfd0ba] focus:border-[#8c624f]',
      badge: 'bg-[#ebd7bc] text-[#543b32]',
    },
    emerald: {
      bg: 'bg-[#0a1812] text-emerald-100',
      sidebar: 'bg-[#0f221a] border-emerald-950',
      editorBg: 'bg-[#122820]',
      noteItemActive: 'bg-[#18342a] shadow-sm border-emerald-500/60 ring-1 ring-emerald-500/30',
      noteItem: 'hover:bg-[#152e24] border-transparent',
      inputBorder: 'border-emerald-950 focus:border-emerald-500',
      badge: 'bg-emerald-900/80 text-emerald-200',
    }
  }[theme];

  return (
    <div className={`flex flex-col h-full ${themeClasses.bg} select-none transition-colors duration-200`}>
      {/* Top Bar */}
      <header className="h-14 px-4 sm:px-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        {/* Left: App Identity */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300"
            title="Toggle Sermon Notes List"
          >
            <List className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight leading-tight flex items-center gap-2">
                <span>Church & Sermon Notes</span>
                {googleUser && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Cloud className="w-3 h-3 text-emerald-500" />
                    <span>Drive Connected</span>
                  </span>
                )}
              </h1>
              <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 hidden sm:inline">
                {driveSyncStatus || 'Auto-saves to Google Drive & device storage'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: Google Drive Status / Connect, Themes, Cloud Backup, New Note */}
        <div className="flex items-center gap-2">
          {/* Google Drive Connection / Status Button */}
          {googleUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDriveMenuOpen(!isDriveMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm"
                title="Google Drive Settings & Sync"
              >
                {/* Official Google G Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="hidden sm:inline">{googleUser.displayName || 'Google Drive'}</span>
                {isDriveSyncing ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Drive Dropdown Menu */}
              {isDriveMenuOpen && (
                <div className="absolute right-0 top-10 w-64 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 flex flex-col gap-2.5 text-xs text-stone-700 dark:text-stone-300">
                  <div className="pb-2 border-b border-stone-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Connected Account</span>
                    <span className="font-extrabold text-stone-900 dark:text-stone-100 truncate block">
                      {googleUser.email}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                      📁 Folder: Church Notes & Sermons
                    </span>
                  </div>

                  {/* Sync All Button */}
                  <button
                    onClick={handleSyncAllToDrive}
                    disabled={isDriveSyncing}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                    <span>{isDriveSyncing ? 'Syncing...' : 'Sync All Notes to Drive'}</span>
                  </button>

                  {/* Open in Drive Folder */}
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-3 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-400 font-semibold flex items-center justify-between"
                  >
                    <span>Open Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Disconnect Drive */}
                  <button
                    onClick={handleDisconnectDrive}
                    className="w-full py-1.5 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-semibold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Google Drive</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Connect Google Drive Button (Styled to standard Google Sign-In) */
            <button
              onClick={handleConnectDrive}
              disabled={isSigningInDrive}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 shadow-sm text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
              title="Connect Google Drive to auto-save all notes"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isSigningInDrive ? 'Connecting...' : 'Connect Drive'}</span>
            </button>
          )}

          {/* Theme switcher */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-black/5 dark:bg-white/10">
            <button
              onClick={() => {
                sounds.playTap();
                setTheme('parchment');
              }}
              className={`p-1.5 rounded-lg text-xs ${theme === 'parchment' ? 'bg-white shadow text-amber-800' : 'text-stone-400'}`}
              title="Parchment Light"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setTheme('midnight');
              }}
              className={`p-1.5 rounded-lg text-xs ${theme === 'midnight' ? 'bg-slate-800 shadow text-indigo-300' : 'text-stone-400'}`}
              title="Midnight Dark"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setTheme('sepia');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${theme === 'sepia' ? 'bg-[#f0e2cc] shadow text-[#4e352b]' : 'text-stone-400'}`}
              title="Sepia"
            >
              Sepia
            </button>
          </div>

          {/* Cloud Vault / Backup */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsBackupModalOpen(true);
            }}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300"
            title="Encrypted Cloud Vault & Sync"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </button>

          {/* "+ New Note" Button */}
          <button
            onClick={handleCreateNewNote}
            className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (2-Column: Left Sermon List, Right Editor Notepad) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Sermon Notes List & Search */}
        <aside
          className={`w-72 sm:w-80 border-r ${themeClasses.sidebar} flex flex-col shrink-0 transition-transform duration-200 z-30 absolute inset-y-0 left-0 md:relative md:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Search box & Tag filter */}
          <div className="p-3 border-b border-black/10 dark:border-white/10 flex flex-col gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sermon notes..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/70 dark:bg-black/20 text-xs border border-black/10 dark:border-white/10 focus:outline-none"
              />
            </div>

            {/* Quick Tag filter pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                    selectedTag === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/5 dark:bg-white/10 text-stone-500'
                  }`}
                >
                  All ({notes.length})
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                      selectedTag === tag
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black/5 dark:bg-white/10 text-stone-500'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List of Sermon Notes */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {notes.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 font-medium flex flex-col items-center gap-3">
                <FileText className="w-8 h-8 opacity-40" />
                <p>No sermon notes yet.<br />Tap "+ New Note" above to write down thoughts during church.</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 font-medium">
                No matching sermon notes found.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === activeNote?.id;

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      sounds.playTap();
                      setActiveNoteId(note.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all text-left group flex flex-col gap-1 relative ${
                      isActive ? themeClasses.noteItemActive : themeClasses.noteItem
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {note.date || 'Church Service'}
                      </span>

                      {/* Google Drive Status & Delete Button on note card */}
                      <div className="flex items-center gap-1">
                        {note.driveFileId && (
                          <span title="Backed up to Google Drive" className="text-emerald-500">
                            <CloudCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playTap();
                            setNoteToDelete(note);
                          }}
                          className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete this sermon note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-xs line-clamp-1">
                      {note.title || 'Untitled Sermon Note'}
                    </h3>

                    {/* Speaker & Passage Badges */}
                    {(note.speaker || note.passage) && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                        {note.speaker && (
                          <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                            <UserIcon className="w-2.5 h-2.5" />
                            {note.speaker}
                          </span>
                        )}
                        {note.passage && (
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[120px]">
                            📖 {note.passage}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Preview snippet */}
                    {note.content && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5 font-normal leading-relaxed">
                        {note.content}
                      </p>
                    )}

                    {/* Photo attached indicator */}
                    {note.photos && note.photos.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>{note.photos.length} slide photo{note.photos.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Active Sermon Note Writing Pad */}
        <main className={`flex-1 flex flex-col overflow-y-auto ${themeClasses.editorBg}`}>
          {activeNote ? (
            <div className="max-w-3xl w-full mx-auto p-5 sm:p-8 flex flex-col gap-4">
              {/* Note Header / Meta Fields */}
              <div className="flex flex-col gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  {/* Date / Service Indicator */}
                  <input
                    type="text"
                    value={activeNote.date || ''}
                    onChange={(e) => updateActiveNote({ date: e.target.value })}
                    placeholder="e.g. Sunday, Oct 4 • Morning Service"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none flex-1"
                  />

                  {/* Top Note Actions: Drive Link, Copy, Audio, and DELETE BUTTON */}
                  <div className="flex items-center gap-1.5">
                    {/* Google Drive status badge / link */}
                    {activeNote.driveWebViewLink && (
                      <a
                        href={activeNote.driveWebViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1"
                        title="View file in Google Drive"
                      >
                        <CloudCheck className="w-3 h-3 text-emerald-500" />
                        <span className="hidden sm:inline">In Drive</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    )}

                    {/* Copy button */}
                    <button
                      onClick={handleCopyNotes}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors relative"
                      title="Copy notes"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedNotification && (
                        <span className="absolute -top-7 right-0 text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </button>

                    {/* Listen button */}
                    <button
                      onClick={handleAudioListen}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                      title="Listen to notes"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Prominent DELETE BUTTON */}
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setNoteToDelete(activeNote);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      title="Delete this sermon note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Note</span>
                    </button>
                  </div>
                </div>

                {/* Sermon Title */}
                <input
                  ref={titleInputRef}
                  type="text"
                  value={activeNote.title || ''}
                  onChange={(e) => updateActiveNote({ title: e.target.value })}
                  placeholder="Sermon Title (e.g. The Good Shepherd)..."
                  className="font-black text-xl sm:text-2xl tracking-tight bg-transparent focus:outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                />

                {/* Speaker & Passage Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={activeNote.speaker || ''}
                      onChange={(e) => updateActiveNote({ speaker: e.target.value })}
                      placeholder="Preacher (e.g. Pastor David)..."
                      className="text-xs font-semibold bg-transparent focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <input
                      type="text"
                      value={activeNote.passage || ''}
                      onChange={(e) => updateActiveNote({ passage: e.target.value })}
                      placeholder="Scripture (e.g. Psalm 23, Romans 8)..."
                      className="text-xs font-semibold bg-transparent focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Sermon Note Helper Formatting Toolbar */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {/* SpeechRecognition Voice Dictation Button */}
                <button
                  onClick={handleToggleDictation}
                  disabled={isSummarizingVoice}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-all active:scale-95 ${
                    isDictating
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-500/40'
                  }`}
                  title="Turn on during sermon to continuously listen, filter noise, and generate neat, structured notes"
                >
                  {isDictating ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Listening ({formatTimer(dictationSeconds)}) • Finish</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Listen to Sermon (AI Clean)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => insertTextAtCursor('• Point: ')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-stone-700 dark:text-stone-300 flex items-center gap-1 whitespace-nowrap"
                  title="Insert Bullet Point"
                >
                  <List className="w-3 h-3 text-emerald-600" />
                  <span>+ Point</span>
                </button>

                <button
                  onClick={() => insertTextAtCursor('“...” — Preacher')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-stone-700 dark:text-stone-300 flex items-center gap-1 whitespace-nowrap"
                  title="Insert Sermon Quote"
                >
                  <Quote className="w-3 h-3 text-amber-600" />
                  <span>+ Quote</span>
                </button>

                <button
                  onClick={() => insertTextAtCursor('📖 Scripture Reference: ')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-stone-700 dark:text-stone-300 flex items-center gap-1 whitespace-nowrap"
                  title="Insert Scripture Callout"
                >
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span>+ Scripture</span>
                </button>

                <button
                  onClick={() => insertTextAtCursor('🙏 My Prayer & Action Takeaway:\n')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-stone-700 dark:text-stone-300 flex items-center gap-1 whitespace-nowrap"
                  title="Insert Personal Takeaway"
                >
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>+ Takeaway</span>
                </button>

                {/* Attach Slide / Bulletin Photo */}
                <label className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-stone-700 dark:text-stone-300 flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <Camera className="w-3 h-3 text-purple-600" />
                  <span>+ Slide / Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Speech Recognition Live Dictation Banner */}
              {(isDictating || isSummarizingVoice || speechNotice) && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 shadow-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {isSummarizingVoice ? (
                        <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                      ) : (
                        <span className="relative flex h-3.5 w-3.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                        </span>
                      )}

                      <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        {isSummarizingVoice ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Synthesizing Deep Sermon Notes & Theological Points...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Sermon Auto-Listener Active ({formatTimer(dictationSeconds)})</span>
                          </>
                        )}
                      </span>

                      {/* Real-time Audio VU Level Meter (Shows audio sensitivity in sanctuary) */}
                      {!isSummarizingVoice && isDictating && (
                        <div 
                          className="flex items-center gap-0.5 h-4 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10" 
                          title={`Live Preacher Voice Sensitivity: ${audioLevel}% (Auto-gain enabled)`}
                        >
                          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((threshold, idx) => {
                            const isActive = (audioLevel / 100) >= threshold;
                            return (
                              <span
                                key={idx}
                                className={`w-1 rounded-full transition-all duration-75 ${
                                  isActive
                                    ? idx > 4
                                      ? 'bg-rose-500 h-3'
                                      : idx > 2
                                      ? 'bg-amber-500 h-2.5'
                                      : 'bg-emerald-500 h-2'
                                    : 'bg-stone-300 dark:bg-stone-700 h-1'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Microphone Sensitivity Mode Switch */}
                    {!isSummarizingVoice && isDictating && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSensitivity}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-xs transition-colors"
                          title="Click to cycle mic sensitivity boost: Sanctuary (+8dB) ↔ Ultra Range (+14dB) ↔ Standard (1x)"
                        >
                          <Sliders className="w-3 h-3 text-amber-600" />
                          <span>
                            Sensitivity: {micSensitivity === 'ultra' ? 'Ultra Range (+14dB)' : micSensitivity === 'high' ? 'Sanctuary (+8dB)' : 'Standard (1x)'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/80 dark:border-amber-800/80">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-700 dark:text-stone-300 italic line-clamp-2">
                        {speechNotice ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold not-italic">{speechNotice}</span>
                        ) : isSummarizingVoice ? (
                          'Extracting full sermon teachings, cross-referencing scriptures, preacher quotes & weekly action steps without dropping details...'
                        ) : (
                          interimTranscript || (dictationBuffer ? `“${dictationBuffer.slice(-160)}”` : 'Listening continuously... Place your device on the pew or desk. When the sermon concludes, tap "Finish & Summarize Notes".')
                        )}
                      </p>

                      {!isSummarizingVoice && !speechNotice && (
                        <div className="flex items-center gap-3 text-[10px] text-stone-500 dark:text-stone-400 font-semibold mt-1">
                          <span>⏱️ Elapsed: {formatTimer(dictationSeconds)}</span>
                          <span>•</span>
                          <span>🎙️ Words Heard: {(accumulatedTextRef.current + ' ' + interimTranscript).trim().split(/\s+/).filter(Boolean).length}</span>
                          <span>•</span>
                          <span>🛡️ Auto-saved in background</span>
                        </div>
                      )}
                    </div>

                    {!isSummarizingVoice && !speechNotice && (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={handleStopAndSummarize}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                          title="Finish sermon listening and generate comprehensive, clean notes"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Finish & Summarize Notes</span>
                        </button>
                        <button
                          onClick={handleCancelDictation}
                          className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-black/5 dark:hover:text-stone-200 transition-colors"
                          title="Cancel listening"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Sermon Notes Body (Simple, Clean, Distraction-Free Textarea) */}
              <div className="flex-1 min-h-[360px] flex flex-col">
                <textarea
                  value={activeNote.content || ''}
                  onChange={(e) => updateActiveNote({ content: e.target.value })}
                  placeholder="Write your sermon notes here, or tap 'Dictate Note (AI Clean)' above to speak..."
                  className="w-full flex-1 min-h-[360px] bg-transparent text-sm sm:text-base leading-relaxed font-serif focus:outline-none resize-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                />
              </div>

              {/* Photos Gallery (Sermon Slides, Bulletins, Handouts) */}
              {activeNote.photos && activeNote.photos.length > 0 && (
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Sermon Slides & Photos ({activeNote.photos.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeNote.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-2xl overflow-hidden aspect-video border border-black/10 dark:border-white/10 bg-black/5 cursor-pointer"
                        onClick={() => setActivePhotoLightbox(photo.dataUrl)}
                      >
                        <img
                          src={photo.dataUrl}
                          alt="Sermon Slide"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(photo.id);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags at bottom */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-400">Tags:</span>
                {(activeNote.tags || []).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-black/5 dark:bg-white/10 text-stone-600 dark:text-stone-400 flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      onClick={() => {
                        const nextTags = (activeNote.tags || []).filter(t => t !== tag);
                        updateActiveNote({ tags: nextTags });
                      }}
                      className="hover:text-rose-500 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {/* Quick Add Common Tags */}
                {['SundaySermon', 'Midweek', 'Youth', 'BibleStudy', 'Worship', 'Grace']
                  .filter(t => !(activeNote.tags || []).includes(t))
                  .slice(0, 3)
                  .map(suggested => (
                    <button
                      key={suggested}
                      onClick={() => {
                        sounds.playTap();
                        updateActiveNote({ tags: [...(activeNote.tags || []), suggested] });
                      }}
                      className="px-2 py-0.5 rounded-lg text-xs font-semibold border border-dashed border-stone-300 dark:border-slate-700 text-stone-400 hover:text-stone-700"
                    >
                      +{suggested}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            /* Clean Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mb-4 shadow-sm">
                📖
              </div>
              <h3 className="font-black text-lg text-stone-800 dark:text-stone-200 mb-1">
                Your Sermon Notes Pad is Empty
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                Take down reflections, key scripture references, and preacher takeaways live during church. Everything automatically saves directly to your device and Google Drive.
              </p>
              <button
                onClick={handleCreateNewNote}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Start Your First Sermon Note</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal (Required for Destructive Operations) */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-stone-900 dark:text-stone-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base">Delete Sermon Note?</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {noteToDelete.driveFileId
                    ? 'This will delete the note from this device and your Google Drive.'
                    : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 font-serif italic bg-stone-50 dark:bg-slate-800 p-3 rounded-xl border border-stone-200 dark:border-slate-700 line-clamp-2">
              "{noteToDelete.title || 'Untitled Sermon Note'}"
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNote}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Slides */}
      {activePhotoLightbox && (
        <div
          onClick={() => setActivePhotoLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer select-none"
        >
          <img
            src={activePhotoLightbox}
            alt="Full slide"
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Encrypted Cloud Backup & Sync Modal */}
      <EncryptedBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        entries={notes}
        onRestoreEntries={(restored) => {
          setNotes(restored);
          if (restored[0]) setActiveNoteId(restored[0].id);
        }}
      />
    </div>
  );
};
