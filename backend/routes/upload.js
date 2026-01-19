import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST /api/upload - Upload image (requires auth)
router.post('/', authenticate, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Return the file path relative to the uploads directory
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      filePath: filePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
});

export default router;
