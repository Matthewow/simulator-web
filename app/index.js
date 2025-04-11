const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({show: false, autoHideMenuBar: true})
    win.maximize()
    win.show()
  
    win.loadURL("http://localhost:3000/")
  }
  
  app.whenReady().then(() => {
    createWindow()
  })