let { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
    win = new BrowserWindow({
      width: 600,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      autoHideMenuBar: true,
    });
  
    win.loadFile(__dirname + "/index.html");
  
    win.addListener("ready-to-show", () => {
      win.show();
    });
  }

app.whenReady().then(() => {
    createWindow();
});
  
app.addListener("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
});
  
    
