const express = require('express');
const http = require('http');
const { app, BrowserWindow } = require('electron');
const { Server } = require('socket.io');
const path = require('path');

let mainWindow;
const server = express();
const httpServer = http.createServer(server);
const io = new Server(httpServer);

const isDev = process.env.NODE_ENV === 'development'; // Check if in development mode

// Serve static files from the 'public' folder
server.use(express.static(path.join(__dirname, 'public')));

// Serve Socket.IO client script explicitly
server.use('/socket.io', express.static(path.join(__dirname, 'node_modules/socket.io/client-dist')));

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
});

// Start the HTTP server on port 3000 for Express
httpServer.listen(3000, () => {
    console.log(`Express server running on http://localhost:3000`);
});

// Function to create the main Electron window
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        // Load Webpack Dev Server URL on port 3001 during development
        mainWindow.loadURL('http://localhost:3001');
    } else {
        // Load production build from the 'dist' folder for distribution
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
};

// Electron app lifecycle events
app.on('ready', createMainWindow);

// Handle app quit for non-macOS platforms
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recreate the window on macOS when the dock icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
