const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;

// Create the main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 800 : 400,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Open devtools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "index.html"));
};

// Create the about window
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "about.html"));
};

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]),
  {
    role: "fileMenu",
  },
];

// If app is ready
app.whenReady().then(() => {
  createWindow();

  //Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Respond to ipcRenderer resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

// Resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // Create filename
    const filename = path.basename(imgPath);

    // Create dest folder if not exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write file to destination
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success to renderer
    mainWindow.webContents.send("image:done");

    // Open dest folder
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

// When app close
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
