const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#050B18', // Match StudyForge Deep Navy
    show: false, // Don't show until ready-to-show
    icon: path.join(__dirname, 'assets/logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !app.isPackaged,
      sandbox: false
    }
  });

  mainWindow.loadFile('index.html');

  // Remove default menu for a cleaner "App" look
  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // mainWindow.maximize(); // Optional
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App Lifecycle
 */
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
