const socket = io();
    const logsDiv = document.getElementById("logs");
    const viewer = document.getElementById("viewer");

    // Load log file list
    fetch("/api/logs")
      .then(res => res.json())
      .then(files => {
        logsDiv.innerHTML = "<b>Select a log:</b><br>";
        files.forEach(file => {
          const btn = document.createElement("button");
          btn.textContent = file;
          btn.onclick = () => {
            viewer.textContent = "";
            socket.emit("watch-log", file);
          };
          logsDiv.appendChild(btn);
        });
      });

    socket.on("log-initial", data => {
      viewer.textContent = data;
      viewer.scrollTop = viewer.scrollHeight;
    });

    socket.on("log-update", chunk => {
      viewer.textContent += chunk;
      viewer.scrollTop = viewer.scrollHeight;
    });

    socket.on("log-error", msg => {
      alert(msg);
    });