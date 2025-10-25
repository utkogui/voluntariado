import express from 'express';
import cdnService from '../services/cdnService.js';
import {
  uploadImage,
  uploadMultipleImages,
  getImage,
  listImages,
  deleteImage,
  getImageStats,
  processImage
} from '../controllers/cdnController.js';

const router = express.Router();

// Configurar multer
const upload = cdnService.getMulterConfig();

// Upload endpoints
router.post('/upload', upload.single('image'), uploadImage);
router.post('/upload/multiple', upload.array('images', 10), uploadMultipleImages);

// Image management endpoints
router.get('/images', listImages);
router.get('/images/:imageId', getImage);
router.delete('/images/:imageId', deleteImage);

// Image processing endpoints
router.post('/images/:imageId/process', processImage);

// Stats endpoint
router.get('/stats', getImageStats);

export default router;
