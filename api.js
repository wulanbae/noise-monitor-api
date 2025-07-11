const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

// === Logika API ===
const dataPath = path.join(__dirname, 'logs.json');

// Baca log
function readLogs() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "[]");
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
}

// POST /api/log
app.post('/api/log', (req, res) => {
  const { db, status } = req.body;

  const newLog = {
    time: new Date().toISOString(),
    db,
    status
  };

  const logs = readLogs();
  logs.push(newLog);

  fs.writeFile(dataPath, JSON.stringify(logs, null, 2), err => {
    if (err) return res.status(500).send("Gagal menyimpan data");
    res.status(200).send("Berhasil disimpan");
  });
});

// GET /api/log?range=...
app.get('/api/log', (req, res) => {
  const logs = readLogs();
  const { range } = req.query;

  if (range === 'today') {
    const today = new Date().toDateString();
    const filtered = logs.filter(log => {
      const logDate = new Date(log.time);
      return logDate.toDateString() === today;
    });
    return res.json(filtered);
  }

  if (range === '7days') {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const filtered = logs.filter(log => {
      const logDate = new Date(log.time);
      return logDate >= sevenDaysAgo && logDate <= now;
    });
    return res.json(filtered);
  }

  // Default: semua log
  res.json(logs);
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
