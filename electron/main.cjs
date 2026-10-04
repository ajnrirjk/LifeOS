const { app, BrowserWindow, Menu, Tray, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
let tray = null;

// Determine if we are in dev or production
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';
const PORT = process.env.LIFEOS_DESKTOP_PORT || 38888;

function createServer() {
  const serverPath = path.join(__dirname, '../dist-server/server.mjs');
  if (fs.existsSync(serverPath)) {
    try {
      const { fork } = require('child_process');
      serverProcess = fork(serverPath, [], {
        env: {
          ...process.env,
          PORT: String(PORT),
          NODE_ENV: 'production',
          LIFEOS_DIST_PATH: path.join(__dirname, '../dist')
        },
        silent: false
      });
      console.log(`[LifeOS Desktop] Embedded server started on PID ${serverProcess.pid}`);
    } catch (err) {
      console.error('[LifeOS Desktop] Failed to fork server process:', err);
    }
  }
}

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve) => {
    function check() {
      http.get(url, () => {
        resolve(true);
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          resolve(false);
        } else {
          setTimeout(check, 300);
        }
      });
    }
    check();
  });
}

async function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon-512.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'LifeOS — Faith, Fellowship & Life Management',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      spellcheck: true
    },
    autoHideMenuBar: true,
    backgroundColor: '#091426',
    show: false
  });

  // Smooth appearance when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external link clicks safely in native browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes(`localhost:${PORT}`) && !url.includes(`127.0.0.1:${PORT}`)) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  // Target URL
  const targetUrl = isDev ? 'http://localhost:3000' : `http://127.0.0.1:${PORT}`;

  if (!isDev) {
    const serverReady = await waitForServer(targetUrl, 10000);
    if (serverReady) {
      mainWindow.loadURL(targetUrl);
    } else {
      const indexPath = path.join(__dirname, '../dist/index.html');
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      } else {
        mainWindow.loadURL(targetUrl);
      }
    }
  } else {
    mainWindow.loadURL(targetUrl);
  }

  // F11 to toggle fullscreen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    if (!isDev) {
      createServer();
    }
    await createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

// IPC Handlers
ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('open-external', (_event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
