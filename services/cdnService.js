import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

class CDNService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.cdnUrl = process.env.CDN_URL || 'https://your-cdn-domain.com';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    // Configurar AWS S3 (ou outro provedor de CDN)
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME || 'volunteer-app-images';
    
    this.ensureUploadDirectory();
  }

  ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Configurar multer para upload
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (this.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize
      }
    });
  }

  // Processar e otimizar imagem
  async processImage(filePath, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg',
      resize = true
    } = options;

    try {
      let image = sharp(filePath);

      if (resize) {
        image = image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Aplicar otimizações baseadas no formato
      switch (format) {
        case 'jpeg':
          image = image.jpeg({ quality });
          break;
        case 'png':
          image = image.png({ quality });
          break;
        case 'webp':
          image = image.webp({ quality });
          break;
        case 'gif':
          image = image.gif();
          break;
      }

      const processedBuffer = await image.toBuffer();
      return processedBuffer;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  // Gerar diferentes tamanhos da imagem
  async generateImageSizes(filePath) {
    const sizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 400, height: 300 },
      { name: 'medium', width: 800, height: 600 },
      { name: 'large', width: 1200, height: 900 }
    ];

    const processedImages = {};

    for (const size of sizes) {
      try {
        const processedBuffer = await this.processImage(filePath, {
          width: size.width,
          height: size.height,
          quality: 85
        });

        const fileName = path.basename(filePath, path.extname(filePath));
        const extension = path.extname(filePath);
        const newFileName = `${fileName}_${size.name}${extension}`;
        const newFilePath = path.join(path.dirname(filePath), newFileName);

        fs.writeFileSync(newFilePath, processedBuffer);
        processedImages[size.name] = {
          fileName: newFileName,
          filePath: newFilePath,
          width: size.width,
          height: size.height,
          size: processedBuffer.length
        };
      } catch (error) {
        console.error(`Error generating ${size.name} size:`, error);
      }
    }

    return processedImages;
  }

  // Upload para CDN (AWS S3)
  async uploadToCDN(filePath, key, contentType) {
    try {
      const fileContent = fs.readFileSync(filePath);
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Error uploading to CDN:', error);
      throw new Error(`Failed to upload to CDN: ${error.message}`);
    }
  }

  // Upload de imagem completa
  async uploadImage(file, options = {}) {
    try {
      const {
        generateSizes = true,
        uploadToCDN = true,
        folder = 'images'
      } = options;

      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const baseFileName = `${fileId}${fileExtension}`;
      const folderPath = path.join(this.uploadDir, folder);
      
      // Criar pasta se não existir
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const filePath = path.join(folderPath, baseFileName);
      
      // Salvar arquivo original
      fs.writeFileSync(filePath, file.buffer);

      const imageData = {
        id: fileId,
        originalName: file.originalname,
        fileName: baseFileName,
        filePath,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
        sizes: {}
      };

      // Gerar diferentes tamanhos
      if (generateSizes) {
        const processedSizes = await this.generateImageSizes(filePath);
        imageData.sizes = processedSizes;
      }

      // Upload para CDN
      if (uploadToCDN) {
        const cdnKey = `${folder}/${baseFileName}`;
        const cdnUrl = await this.uploadToCDN(filePath, cdnKey, file.mimetype);
        imageData.cdnUrl = cdnUrl;

        // Upload dos tamanhos para CDN
        if (generateSizes && imageData.sizes) {
          for (const [sizeName, sizeData] of Object.entries(imageData.sizes)) {
            const sizeCdnKey = `${folder}/${sizeData.fileName}`;
            const sizeCdnUrl = await this.uploadToCDN(
              sizeData.filePath, 
              sizeCdnKey, 
              file.mimetype
            );
            imageData.sizes[sizeName].cdnUrl = sizeCdnUrl;
          }
        }
      }

      return imageData;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Deletar imagem do CDN
  async deleteFromCDN(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('Error deleting from CDN:', error);
      throw new Error(`Failed to delete from CDN: ${error.message}`);
    }
  }

  // Deletar imagem local
  deleteLocalFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting local file:', error);
      return false;
    }
  }

  // Deletar imagem completa (local + CDN)
  async deleteImage(imageData) {
    try {
      const deletedFiles = [];

      // Deletar arquivo original local
      if (this.deleteLocalFile(imageData.filePath)) {
        deletedFiles.push(imageData.filePath);
      }

      // Deletar tamanhos locais
      if (imageData.sizes) {
        for (const sizeData of Object.values(imageData.sizes)) {
          if (this.deleteLocalFile(sizeData.filePath)) {
            deletedFiles.push(sizeData.filePath);
          }
        }
      }

      // Deletar do CDN
      if (imageData.cdnUrl) {
        const cdnKey = imageData.cdnUrl.split('/').pop();
        await this.deleteFromCDN(cdnKey);
        deletedFiles.push(`CDN: ${cdnKey}`);
      }

      return {
        success: true,
        deletedFiles,
        message: `Deleted ${deletedFiles.length} files`
      };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  // Obter URL da imagem
  getImageUrl(imageData, size = 'original') {
    if (size === 'original') {
      return imageData.cdnUrl || `${this.cdnUrl}/${imageData.fileName}`;
    }

    if (imageData.sizes && imageData.sizes[size]) {
      return imageData.sizes[size].cdnUrl || 
             `${this.cdnUrl}/${imageData.sizes[size].fileName}`;
    }

    return imageData.cdnUrl || `${this.cdnUrl}/${imageData.fileName}`;
  }

  // Validar arquivo de imagem
  validateImageFile(file) {
    const errors = [];

    if (!file) {
      errors.push('Nenhum arquivo fornecido');
      return { valid: false, errors };
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      errors.push('Tipo de arquivo não permitido');
    }

    if (file.size > this.maxFileSize) {
      errors.push(`Arquivo muito grande. Máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obter estatísticas de uso
  async getStorageStats() {
    try {
      const params = {
        Bucket: this.bucketName,
        MaxKeys: 1000
      };

      const result = await this.s3.listObjectsV2(params).promise();
      
      let totalSize = 0;
      let imageCount = 0;

      if (result.Contents) {
        for (const object of result.Contents) {
          totalSize += object.Size;
          if (this.allowedTypes.some(type => object.Key.includes(type))) {
            imageCount++;
          }
        }
      }

      return {
        totalImages: imageCount,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        bucketName: this.bucketName
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }
}

// Singleton instance
const cdnService = new CDNService();

export default cdnService;
