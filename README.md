# ![Live-Log-Viewer](public/favicon-32x32.png) Live Log Viewer

A lightweight **real-time log viewer** built with Node.js and Socket.IO.
It lets you browse log files from a directory and stream updates live in your browser — similar to `tail -f`, but with a web UI.

---

## 🚀 Features

* 📂 Lists log files from a configurable directory
* ⚡ Streams log updates in real time
* 🧩 Supports multiple log file extensions
* 🐳 Fully Dockerized
* ⚙️ Configuration via `.env`
* 🌐 Single Node.js app (backend + UI)

---

## 🏗 Tech Stack

* Node.js
* Express
* Socket.IO
* Chokidar (file watching)
* Docker

---

## 📁 Project Structure

```
live-log-viewer/
│
├── public/
│   ├── index.html     # UI
│   └── script.js      # Frontend logic
│
├── logs/              # Default log directory (can be changed)
├── server.js          # Backend server
├── package.json
├── Dockerfile
├── .env               # Configuration
└── README.md
```

---

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
LOG_DIR=./logs
LOG_EXTENSIONS=.log,.txt
PORT=3000
ALLOWED_IP=192.168.1.1/24
```

### Variables

| Variable         | Description                               | Example                |
| ---------------- | ----------------------------------------- | ---------------------- |
| `LOG_DIR`        | Directory containing log files            | `./logs` or `/var/log` |
| `LOG_EXTENSIONS` | Allowed file extensions (comma separated) | `.log,.txt`            |
| `PORT`           | Port the web server runs on               | `3000`                 |
| `ALLOWED_IP`     | Ip that can view the logs                 | `192.168.1.1/24`  (put your public ip)     |

---

## 🖥 Run Locally

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Create .env
```bash
cp .env.example .env
```

### 3️⃣ Start the server

```bash
node server.js
```

### 4️⃣ Open in browser

```
http://localhost:3000
```

---

## 🐳 Run with Docker

### Build image

```bash
docker build -t live-log-viewer .
```

### Run container

```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  -v /var/log:/app/logs:ro \
  --name logviewer \
  live-log-viewer
```

Then open:

```
http://localhost:3000
```

---


## 🐳 Run Locally with docker compose

### `docker-compose.dev.yml` 
```bash

version: "3.9"

services:
  logviewer:
    build: .
    container_name: logviewer
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs:ro
    restart: unless-stopped

```


## 🐳 Deploy using docker compose
###  `docker-compose-prod.yml`
```bash
version: "3.9"

services:
  logviewer:
    image: subratade9ok/live-log-viewer
    container_name: logviewer
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs:ro
    restart: unless-stopped
```



## 🧪 Testing Live Streaming

Append to a log file:

```bash
echo "New log entry $(date)" >> logs/app.log
```

The update should instantly appear in the browser.

---

## 🔒 Security Notes

* This app is meant for **internal or trusted environments**
* Anyone who can access the web UI can read logs
* For production use, put it behind:

  * A VPN
  * Reverse proxy auth (Nginx/Traefik)
  * Firewall restrictions

---

## 🛠 Possible Future Improvements

* Log search and filtering
* Highlight errors and warnings
* Multi-user optimization (shared watchers)
* Dark/light theme toggle
* Download log files


> feel free to send pr with these improvements 


---

## 📜 License

MIT — free to use, modify, and share.
