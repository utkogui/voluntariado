import { useState, useCallback, useEffect } from 'react';
import cdnService from '../services/cdnService';

const useCDN = () => {
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (fetchFunction, setterFunction) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setterFunction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchImages = useCallback((options = {}) => {
    return fetchData(
      () => cdnService.listImages(options),
      (data) => setImages(data.images || [])
    );
  }, [fetchData]);

  const fetchStats = useCallback(() => {
    return fetchData(
      cdnService.getImageStats,
      (data) => setStats(data)
    );
  }, [fetchData]);

  const uploadImage = useCallback(async (file, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validar arquivo
      const validation = cdnService.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await cdnService.uploadImage(file, options);
      await fetchImages(); // Refresh list
      await fetchStats(); // Refresh stats
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchImages, fetchStats]);

  const uploadMultipleImages = useCallback(async (files, options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      // Validar arquivos
      const validationErrors = [];
      files.forEach((file, index) => {
        const validation = cdnService.validateFile(file);
        if (!validation.valid) {
          validationErrors.push(`Arquivo ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('; '));
      }

      const response = await cdnService.uploadMultipleImages(files, options);
      await fetchImages(); // Refresh list
      await fetchStats(); // Refresh stats
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchImages, fetchStats]);

  const deleteImage = useCallback(async (imageId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cdnService.deleteImage(imageId);
      await fetchImages(); // Refresh list
      await fetchStats(); // Refresh stats
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchImages, fetchStats]);

  const processImage = useCallback(async (imageId, options) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cdnService.processImage(imageId, options);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getImageUrl = useCallback((image, size = 'original') => {
    return cdnService.getImageUrl(image, size);
  }, []);

  const validateFile = useCallback((file, maxSize) => {
    return cdnService.validateFile(file, maxSize);
  }, []);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchImages(),
      fetchStats()
    ]);
  }, [fetchImages, fetchStats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    images,
    stats,
    isLoading,
    error,
    fetchImages,
    fetchStats,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    processImage,
    getImageUrl,
    validateFile,
    fetchAllData
  };
};

export default useCDN;
