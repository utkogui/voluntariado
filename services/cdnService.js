const AWS = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const config = require('../config/production');

class CDNService {
  constructor() {
    this.s3 = null;
    this.cloudFront = null;
    this.initializeServices();
  }

  initializeServices() {
    // Initialize S3
    if (config.aws.accessKeyId && config.aws.secretAccessKey) {
      this.s3 = new AWS.S3({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region
      });
    }

    // Initialize CloudFront
    if (config.aws.accessKeyId && config.aws.secretAccessKey) {
      this.cloudFront = new AWS.CloudFront({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region
      });
    }
  }

  // Upload file to S3
  async uploadFile(filePath, key, options = {}) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const contentType = this.getContentType(filePath);
      
      const uploadParams = {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: options.acl || 'public-read',
        CacheControl: options.cacheControl || 'max-age=31536000',
        Metadata: {
          'upload-date': new Date().toISOString(),
          'original-name': path.basename(filePath)
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      return {
        success: true,
        url: result.Location,
        key: key,
        etag: result.ETag
      };
    } catch (error) {
      console.error('Failed to upload file to S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload image with optimization
  async uploadImage(filePath, key, options = {}) {
    try {
      const {
        width = null,
        height = null,
        quality = 80,
        format = 'webp',
        resize = true
      } = options;

      let processedImage;
      
      if (resize && (width || height)) {
        processedImage = await sharp(filePath)
          .resize(width, height, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .toFormat(format, { quality })
          .toBuffer();
      } else {
        processedImage = await sharp(filePath)
          .toFormat(format, { quality })
          .toBuffer();
      }

      const uploadParams = {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: processedImage,
        ContentType: `image/${format}`,
        ACL: 'public-read',
        CacheControl: 'max-age=31536000',
        Metadata: {
          'upload-date': new Date().toISOString(),
          'original-name': path.basename(filePath),
          'processed': 'true',
          'format': format,
          'quality': quality.toString()
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      return {
        success: true,
        url: result.Location,
        key: key,
        etag: result.ETag,
        size: processedImage.length,
        format: format
      };
    } catch (error) {
      console.error('Failed to upload image to S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload multiple image sizes
  async uploadImageSizes(filePath, baseKey, sizes = []) {
    try {
      const results = [];
      
      for (const size of sizes) {
        const { width, height, suffix } = size;
        const key = `${baseKey}_${suffix}`;
        
        const result = await this.uploadImage(filePath, key, {
          width,
          height,
          quality: 80,
          format: 'webp'
        });
        
        results.push({
          size: suffix,
          width,
          height,
          ...result
        });
      }
      
      return {
        success: true,
        sizes: results
      };
    } catch (error) {
      console.error('Failed to upload image sizes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: config.aws.s3Bucket,
        Key: key
      };

      await this.s3.deleteObject(deleteParams).promise();
      
      return {
        success: true,
        message: `File ${key} deleted successfully`
      };
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List files in S3
  async listFiles(prefix = '', maxKeys = 1000) {
    try {
      const listParams = {
        Bucket: config.aws.s3Bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await this.s3.listObjectsV2(listParams).promise();
      
      const files = result.Contents.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag,
        url: `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${obj.Key}`
      }));

      return {
        success: true,
        files: files,
        total: result.KeyCount
      };
    } catch (error) {
      console.error('Failed to list files from S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get file URL
  getFileUrl(key) {
    return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
  }

  // Get CloudFront URL
  getCloudFrontUrl(key) {
    if (config.cdn.url) {
      return `${config.cdn.url}/${key}`;
    }
    return this.getFileUrl(key);
  }

  // Generate signed URL
  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      
      return {
        success: true,
        url: url,
        expiresIn: expiresIn
      };
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Invalidate CloudFront cache
  async invalidateCache(paths) {
    try {
      if (!this.cloudFront) {
        throw new Error('CloudFront not configured');
      }

      const params = {
        DistributionId: config.aws.cloudFrontDistributionId,
        InvalidationBatch: {
          CallerReference: `invalidation-${Date.now()}`,
          Paths: {
            Quantity: paths.length,
            Items: paths
          }
        }
      };

      const result = await this.cloudFront.createInvalidation(params).promise();
      
      return {
        success: true,
        invalidationId: result.Invalidation.Id,
        status: result.Invalidation.Status
      };
    } catch (error) {
      console.error('Failed to invalidate CloudFront cache:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get content type
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg'
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  // Optimize image
  async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = null,
        height = null,
        quality = 80,
        format = 'webp'
      } = options;

      await sharp(inputPath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toFormat(format, { quality })
        .toFile(outputPath);

      return {
        success: true,
        outputPath: outputPath,
        format: format
      };
    } catch (error) {
      console.error('Failed to optimize image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload static assets
  async uploadStaticAssets(assetsDir) {
    try {
      const results = [];
      const files = fs.readdirSync(assetsDir, { recursive: true });

      for (const file of files) {
        if (fs.statSync(path.join(assetsDir, file)).isFile()) {
          const filePath = path.join(assetsDir, file);
          const key = `static/${file}`;
          
          const result = await this.uploadFile(filePath, key, {
            cacheControl: 'max-age=31536000'
          });
          
          results.push({
            file: file,
            key: key,
            ...result
          });
        }
      }

      return {
        success: true,
        uploaded: results.length,
        results: results
      };
    } catch (error) {
      console.error('Failed to upload static assets:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get CDN statistics
  async getCDNStats() {
    try {
      const stats = {
        s3Bucket: config.aws.s3Bucket,
        cloudFrontUrl: config.cdn.url,
        region: config.aws.region,
        timestamp: Date.now()
      };

      // Get S3 bucket info
      if (this.s3) {
        const listParams = {
          Bucket: config.aws.s3Bucket,
          MaxKeys: 1
        };

        const result = await this.s3.listObjectsV2(listParams).promise();
        stats.totalObjects = result.KeyCount;
      }

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Failed to get CDN stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const cdnService = new CDNService();

module.exports = cdnService;