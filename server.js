require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { validateClientIP } = require("./src/utils/security.utils.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Load config from .env
const LOG_DIR = path.resolve(process.env.LOG_DIR || "./logs");
const LOG_EXTENSIONS = (process.env.LOG_EXTENSIONS || ".log")
  .split(",")
  .map(ext => ext.trim().toLowerCase());
const PORT = process.env.PORT || 3000;

let watchers = {};

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  console.error("Log directory does not exist:", LOG_DIR);
  process.exit(1);
}

app.use(express.static(path.join(__dirname, "public")));

// API: List log files
app.get("/api/logs", (req, res) => {

  if(!validateClientIP(req)) return;

  fs.readdir(LOG_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read log dir" });

    const logFiles = files.filter(file =>
      LOG_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );

    res.json(logFiles);
  });
});

// Socket.IO logic
io.on("connection", (socket) => {
  // console.log("Client connected:", socket.id);
  const ip = socket.handshake.address;
  // console.log(`Client IP: ${ip}`);

  if(!validateClientIP(socket)) return;
  // console.log("Clients connected:", io.engine.clientsCount);



  socket.on("watch-log", (filename) => {
    const filePath = path.join(LOG_DIR, filename);

    // Security: prevent path traversal
    if (!filePath.startsWith(LOG_DIR)) {
      socket.emit("log-error", "Invalid file path");
      return;
    }

    if (!fs.existsSync(filePath)) {
      socket.emit("log-error", "File not found");
      return;
    }

    // Close old watcher
    if (watchers[socket.id]) {
      watchers[socket.id].close();
    }

    // Send existing content
    const initialContent = fs.readFileSync(filePath, "utf8");
    socket.emit("log-initial", initialContent);

    let lastSize = fs.statSync(filePath).size;

    const watcher = chokidar.watch(filePath, {
      usePolling: true,
      interval: 1000,
    });

    watcher.on("change", () => {
      const stats = fs.statSync(filePath);
      if (stats.size > lastSize) {
        const stream = fs.createReadStream(filePath, {
          start: lastSize,
          end: stats.size,
        });

        stream.on("data", chunk => {
          socket.emit("log-update", chunk.toString());
        });

        lastSize = stats.size;
      }
    });

    watchers[socket.id] = watcher;
  });

  socket.on("disconnect", () => {
    if (watchers[socket.id]) {
      watchers[socket.id].close();
      delete watchers[socket.id];
    }
    // console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📂 Watching logs in: ${LOG_DIR}`);
  console.log(`🧾 Extensions allowed: ${LOG_EXTENSIONS.join(", ")}`);
});
