import api from './api';

const CDN_API_BASE_URL = '/api/cdn';

const cdnService = {
  uploadImage: async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.generateSizes !== undefined) {
        formData.append('generateSizes', options.generateSizes);
      }
      if (options.uploadToCDN !== undefined) {
        formData.append('uploadToCDN', options.uploadToCDN);
      }

      const response = await api.post(`${CDN_API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  uploadMultipleImages: async (files, options = {}) => {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('images', file);
      });
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.generateSizes !== undefined) {
        formData.append('generateSizes', options.generateSizes);
      }
      if (options.uploadToCDN !== undefined) {
        formData.append('uploadToCDN', options.uploadToCDN);
      }

      const response = await api.post(`${CDN_API_BASE_URL}/upload/multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  },

  getImage: async (imageId, size = 'original') => {
    try {
      const response = await api.get(`${CDN_API_BASE_URL}/images/${imageId}`, {
        params: { size }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting image:', error);
      throw error;
    }
  },

  listImages: async (options = {}) => {
    try {
      const { folder, limit = 50, offset = 0, size = 'original' } = options;
      
      const response = await api.get(`${CDN_API_BASE_URL}/images`, {
        params: { folder, limit, offset, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error listing images:', error);
      throw error;
    }
  },

  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`${CDN_API_BASE_URL}/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  processImage: async (imageId, options = {}) => {
    try {
      const { width, height, quality, format } = options;
      
      const response = await api.post(`${CDN_API_BASE_URL}/images/${imageId}/process`, {
        width,
        height,
        quality,
        format
      });
      return response.data;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  },

  getImageStats: async () => {
    try {
      const response = await api.get(`${CDN_API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting image stats:', error);
      throw error;
    }
  },

  // Helper function to get image URL
  getImageUrl: (image, size = 'original') => {
    if (size === 'original') {
      return image.cdnUrl || image.url;
    }

    if (image.sizes && image.sizes[size]) {
      return image.sizes[size].cdnUrl || image.sizes[size].url;
    }

    return image.cdnUrl || image.url;
  },

  // Helper function to validate file
  validateFile: (file, maxSize = 10 * 1024 * 1024) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const errors = [];

    if (!file) {
      errors.push('Nenhum arquivo selecionado');
      return { valid: false, errors };
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.');
    }

    if (file.size > maxSize) {
      errors.push(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default cdnService;
