import cdnService from '../services/cdnService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhum arquivo fornecido'
      });
    }

    // Validar arquivo
    const validation = cdnService.validateImageFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Arquivo inválido',
        errors: validation.errors
      });
    }

    const { folder = 'images', generateSizes = true, uploadToCDN = true } = req.body;

    // Upload da imagem
    const imageData = await cdnService.uploadImage(req.file, {
      generateSizes: generateSizes === 'true',
      uploadToCDN: uploadToCDN === 'true',
      folder
    });

    // Salvar metadados no banco
    const savedImage = await prisma.image.create({
      data: {
        id: imageData.id,
        originalName: imageData.originalName,
        fileName: imageData.fileName,
        filePath: imageData.filePath,
        cdnUrl: imageData.cdnUrl,
        size: imageData.size,
        mimeType: imageData.mimeType,
        folder,
        sizes: imageData.sizes,
        uploadedAt: new Date(imageData.uploadedAt)
      }
    });

    res.status(201).json({
      message: 'Imagem enviada com sucesso',
      image: savedImage
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      message: 'Falha ao enviar imagem',
      error: error.message
    });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'Nenhum arquivo fornecido'
      });
    }

    const { folder = 'images', generateSizes = true, uploadToCDN = true } = req.body;
    const uploadedImages = [];

    for (const file of req.files) {
      // Validar arquivo
      const validation = cdnService.validateImageFile(file);
      if (!validation.valid) {
        console.warn(`Arquivo inválido ignorado: ${file.originalname}`, validation.errors);
        continue;
      }

      try {
        // Upload da imagem
        const imageData = await cdnService.uploadImage(file, {
          generateSizes: generateSizes === 'true',
          uploadToCDN: uploadToCDN === 'true',
          folder
        });

        // Salvar metadados no banco
        const savedImage = await prisma.image.create({
          data: {
            id: imageData.id,
            originalName: imageData.originalName,
            fileName: imageData.fileName,
            filePath: imageData.filePath,
            cdnUrl: imageData.cdnUrl,
            size: imageData.size,
            mimeType: imageData.mimeType,
            folder,
            sizes: imageData.sizes,
            uploadedAt: new Date(imageData.uploadedAt)
          }
        });

        uploadedImages.push(savedImage);
      } catch (error) {
        console.error(`Error uploading image ${file.originalname}:`, error);
      }
    }

    res.status(201).json({
      message: `${uploadedImages.length} imagens enviadas com sucesso`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({
      message: 'Falha ao enviar imagens',
      error: error.message
    });
  }
};

const getImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { size = 'original' } = req.query;

    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({
        message: 'Imagem não encontrada'
      });
    }

    const imageUrl = cdnService.getImageUrl(image, size);

    res.status(200).json({
      image: {
        ...image,
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({
      message: 'Falha ao obter imagem',
      error: error.message
    });
  }
};

const listImages = async (req, res) => {
  try {
    const { 
      folder, 
      limit = 50, 
      offset = 0,
      size = 'original'
    } = req.query;

    const where = folder ? { folder } : {};

    const images = await prisma.image.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Adicionar URLs para cada imagem
    const imagesWithUrls = images.map(image => ({
      ...image,
      url: cdnService.getImageUrl(image, size)
    }));

    res.status(200).json({
      images: imagesWithUrls,
      count: images.length
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      message: 'Falha ao listar imagens',
      error: error.message
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({
        message: 'Imagem não encontrada'
      });
    }

    // Deletar arquivos físicos
    const deleteResult = await cdnService.deleteImage(image);

    // Deletar registro do banco
    await prisma.image.delete({
      where: { id: imageId }
    });

    res.status(200).json({
      message: 'Imagem deletada com sucesso',
      deleteResult
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      message: 'Falha ao deletar imagem',
      error: error.message
    });
  }
};

const getImageStats = async (req, res) => {
  try {
    const stats = await cdnService.getStorageStats();
    
    // Adicionar estatísticas do banco
    const totalImages = await prisma.image.count();
    const imagesByFolder = await prisma.image.groupBy({
      by: ['folder'],
      _count: { id: true }
    });

    res.status(200).json({
      storage: stats,
      database: {
        totalImages,
        imagesByFolder
      }
    });
  } catch (error) {
    console.error('Error getting image stats:', error);
    res.status(500).json({
      message: 'Falha ao obter estatísticas',
      error: error.message
    });
  }
};

const processImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { width, height, quality, format } = req.body;

    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return res.status(404).json({
        message: 'Imagem não encontrada'
      });
    }

    // Processar imagem
    const processedBuffer = await cdnService.processImage(image.filePath, {
      width: parseInt(width),
      height: parseInt(height),
      quality: parseInt(quality),
      format
    });

    // Salvar imagem processada
    const processedFileName = `processed_${image.fileName}`;
    const processedFilePath = image.filePath.replace(image.fileName, processedFileName);
    
    require('fs').writeFileSync(processedFilePath, processedBuffer);

    res.status(200).json({
      message: 'Imagem processada com sucesso',
      processedImage: {
        fileName: processedFileName,
        filePath: processedFilePath,
        size: processedBuffer.length,
        width: parseInt(width),
        height: parseInt(height),
        quality: parseInt(quality),
        format
      }
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      message: 'Falha ao processar imagem',
      error: error.message
    });
  }
};

export {
  uploadImage,
  uploadMultipleImages,
  getImage,
  listImages,
  deleteImage,
  getImageStats,
  processImage
};
