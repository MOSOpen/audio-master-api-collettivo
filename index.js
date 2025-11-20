const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

const uploadsDir = path.join(__dirname, 'uploads');
const masterDir = path.join(__dirname, 'master');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(masterDir)) {
  fs.mkdirSync(masterDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname).toLowerCase() === '.wav') {
      cb(null, true);
    } else {
      cb(new Error('Only .wav files are allowed!'), false);
    }
  }
});

app.use('/master', express.static(masterDir));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Audio Mastering API',
    endpoints: {
      upload: 'POST /upload - Upload a .wav file for mastering',
      download: 'GET /master/<filename> - Download a mastered file'
    }
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded or invalid file type' 
      });
    }

    const originalFilename = req.file.originalname;
    const uploadedFilePath = req.file.path;
    
    const uniqueId = crypto.randomUUID().replace(/-/g, '');
    const masterFilename = `SGL_666_${uniqueId}_MASTER.wav`;
    const masterFilePath = path.join(masterDir, masterFilename);

    fs.copyFileSync(uploadedFilePath, masterFilePath);

    const protocol = req.protocol;
    const host = req.get('host');
    const downloadLink = `${protocol}://${host}/master/${masterFilename}`;

    res.json({
      success: true,
      originalFilename: originalFilename,
      masterFilename: masterFilename,
      downloadLink: downloadLink
    });

  } catch (error) {
    console.error('Error during file processing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error processing file', 
      details: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false, 
      error: 'File upload error', 
      details: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Upload endpoint: POST http://0.0.0.0:${PORT}/upload`);
  console.log(`Master files available at: GET http://0.0.0.0:${PORT}/master/<filename>`);
});
