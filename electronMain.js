// electronMain.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); // Import the 'fs' module to work with the file system
const express = require('express');
const serverApp = require('./server'); // Import your existing Express server

function createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false, // Keeping nodeIntegration false for better security
      }
    });
  
    win.loadFile('public/screens/homescreen.html');
    win.webContents.openDevTools();
  }
  
  app.on('ready', () => {
    serverApp.listen(3000, () => {
        console.log('Express server running on port 3000');
    });
    createWindow();
});
  
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
  
  // Handle the save-audio-file event
  ipcMain.on('save-audio-file', (event, data) => {
    const filePath = path.join(app.getPath('desktop'), `recorded_audio_${Date.now()}.wav`);
  
    fs.writeFile(filePath, Buffer.from(data.buffer), (err) => {
      if (err) {
        console.error('Failed to save audio file:', err);
      } else {
        console.log('Audio file saved successfully:', filePath);
      }
    });
  });