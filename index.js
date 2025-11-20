const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

// cartelle per upload e master
const uploadDir = path.join(__dirname, "uploads");
const masterDir = path.join(__dirname, "master");

// assicura che esistano
[uploadDir, masterDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// configurazione multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// endpoint di benvenuto
app.get("/", (req, res) => {
  res.json({ message: "Audio Master API Collettivo attivo ⚡" });
});

// upload e simulazione mastering
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

  const inputFile = path.join(uploadDir, req.file.filename);
  const outputFile = path.join(masterDir, "MASTER_" + req.file.filename);

  fs.copyFileSync(inputFile, outputFile);

  res.json({
    originalFilename: req.file.filename,
    masterFilename: "MASTER_" + req.file.filename,
    downloadLink: `/master/MASTER_${req.file.filename}`
  });
});

// serve i file masterizzati
app.use("/master", express.static(masterDir));

// porta per Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server attivo su porta ${PORT}`);
});
