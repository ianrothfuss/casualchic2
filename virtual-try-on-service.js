// Virtual Try-On Service Implementation for Casual Chic Boutique 2.0

// backend/src/services/virtual-try-on.js

import { BaseService } from "medusa-interfaces";
import { MedusaError } from "medusa-core-utils";
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import fs from 'fs';

class VirtualTryOnService extends BaseService {
  constructor(container) {
    super();
    
    this.virtualTryOnRepository_ = container.virtualTryOnRepository;
    this.productService_ = container.productService;
    this.customerService_ = container.customerService;
    this.fileService_ = container.fileService;
    this.eventBus_ = container.eventBusService;
    
    this.config_ = container.configModule.projectConfig;
    
    // Configuration for AI try-on service
    this.tryOnApiUrl = this.config_.try_on_api_url || "https://try-on-api.example.com/generate";
    this.tryOnApiKey = this.config_.try_on_api_key || "";
  }

  /**
   * Creates a new virtual try-on request
   * @param {Object} data - Try-on request data
   * @returns {Promise<Object>} Created try-on request
   */
  async create(data) {
    return this.atomicPhase_(async (manager) => {
      const virtualTryOnRepo = manager.getCustomRepository(this.virtualTryOnRepository_);
      
      // Validate required fields
      const { user_id, product_id, user_image_id } = data;
      
      if (!user_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "User ID is required"
        );
      }
      
      if (!product_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Product ID is required"
        );
      }
      
      if (!user_image_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "User image ID is required"
        );
      }
      
      // Verify user exists
      try {
        await this.customerService_.retrieve(user_id);
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "User not found"
        );
      }
      
      // Verify product exists
      try {
        await this.productService_.retrieve(product_id);
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "Product not found"
        );
      }
      
      // Verify user image exists
      try {
        await this.fileService_.getFile(user_image_id);
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "User image not found"
        );
      }
      
      // Create the virtual try-on request
      const virtualTryOn = virtualTryOnRepo.create({
        user_id,
        product_id,
        user_image_id,
        result_image_id: null,
        status: 'pending',
        metadata: data.metadata || {}
      });
      
      const result = await virtualTryOnRepo.save(virtualTryOn);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("virtual_try_on.created", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Retrieves a virtual try-on request by ID
   * @param {String} id - Virtual try-on ID
   * @param {Object} config - Configuration options
   * @returns {Promise<Object>} Virtual try-on request
   */
  async retrieve(id, config = {}) {
    const virtualTryOnRepo = this.manager_.getCustomRepository(this.virtualTryOnRepository_);
    
    const query = buildQuery({ id }, config);
    
    const virtualTryOn = await virtualTryOnRepo.findOne(query);
    
    if (!virtualTryOn) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Virtual try-on with id: ${id} was not found`
      );
    }
    
    return virtualTryOn;
  }

  /**
   * Lists virtual try-on requests based on selector
   * @param {Object} selector - Selector criteria
   * @param {Object} config - Configuration options
   * @returns {Promise<Array>} Virtual try-on requests matching criteria
   */
  async list(selector = {}, config = {}) {
    const virtualTryOnRepo = this.manager_.getCustomRepository(this.virtualTryOnRepository_);
    
    const query = buildQuery(selector, config);
    
    return await virtualTryOnRepo.find(query);
  }

  /**
   * Updates a virtual try-on request
   * @param {String} id - Virtual try-on ID
   * @param {Object} update - Update data
   * @returns {Promise<Object>} Updated virtual try-on request
   */
  async update(id, update) {
    return this.atomicPhase_(async (manager) => {
      const virtualTryOnRepo = manager.getCustomRepository(this.virtualTryOnRepository_);
      
      // Get existing record
      const virtualTryOn = await this.retrieve(id);
      
      // Update fields
      const {
        status,
        result_image_id,
        metadata
      } = update;
      
      if (status !== undefined) {
        virtualTryOn.status = status;
      }
      
      if (result_image_id !== undefined) {
        virtualTryOn.result_image_id = result_image_id;
      }
      
      if (metadata) {
        virtualTryOn.metadata = {
          ...virtualTryOn.metadata,
          ...metadata
        };
      }
      
      const result = await virtualTryOnRepo.save(virtualTryOn);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("virtual_try_on.updated", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Gets virtual try-on requests for a specific user
   * @param {String} userId - User ID
   * @param {Object} config - Configuration options
   * @returns {Promise<Array>} Virtual try-on requests for the user
   */
  async listByUser(userId, config = {}) {
    return this.list({ user_id: userId }, config);
  }

  /**
   * Starts the generation process for a virtual try-on
   * @param {String} tryOnId - Virtual try-on ID
   * @returns {Promise<Object>} Updated virtual try-on request
   */
  async startGeneration(tryOnId) {
    return this.atomicPhase_(async (manager) => {
      // Get the virtual try-on request with relations
      const virtualTryOn = await this.retrieve(tryOnId);
      
      // Check if already processing or completed
      if (virtualTryOn.status !== 'pending') {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Cannot start generation for try-on with status: ${virtualTryOn.status}`
        );
      }
      
      try {
        // Update status to processing
        await this.update(tryOnId, { status: 'processing' });
        
        // Get user image and product
        const userImage = await this.fileService_.getFile(virtualTryOn.user_image_id);
        const product = await this.productService_.retrieve(virtualTryOn.product_id, {
          relations: ['images']
        });
        
        // Get product image
        const productImage = product.images && product.images.length > 0
          ? product.images[0]
          : null;
        
        if (!productImage) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Product does not have any images"
          );
        }
        
        // Generate the try-on image
        const resultImageId = await this.generateTryOnImage(
          userImage.url,
          productImage.url,
          virtualTryOn.metadata
        );
        
        // Update the try-on request with the result
        return this.update(tryOnId, {
          status: 'completed',
          result_image_id: resultImageId
        });
        
      } catch (error) {
        // Update status to failed and save error message
        await this.update(tryOnId, {
          status: 'failed',
          metadata: {
            ...virtualTryOn.metadata,
            error_message: error.message
          }
        });
        
        throw error;
      }
    });
  }

  /**
   * Generates a try-on image using an AI service
   * @param {String} userImageUrl - URL of the user image
   * @param {String} productImageUrl - URL of the product image
   * @param {Object} options - Additional options
   * @returns {Promise<String>} ID of the generated result image
   */
  async generateTryOnImage(userImageUrl, productImageUrl, options = {}) {
    try {
      // Download the images
      const userImageResponse = await axios.get(userImageUrl, { responseType: 'arraybuffer' });
      const productImageResponse = await axios.get(productImageUrl, { responseType: 'arraybuffer' });
      
      // Create temporary files
      const tempDir = path.join(__dirname, '..', '..', 'uploads', 'temp');
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const userImagePath = path.join(tempDir, `user_${Date.now()}.jpg`);
      const productImagePath = path.join(tempDir, `product_${Date.now()}.jpg`);
      
      fs.writeFileSync(userImagePath, userImageResponse.data);
      fs.writeFileSync(productImagePath, productImageResponse.data);
      
      // Prepare request to AI try-on service
      const formData = new FormData();
      formData.append('user_image', fs.createReadStream(userImagePath));
      formData.append('product_image', fs.createReadStream(productImagePath));
      
      // Add additional options
      if (options.pose) {
        formData.append('pose', options.pose);
      }
      
      if (options.background) {
        formData.append('background', options.background);
      }
      
      // Call the AI try-on service
      const tryOnResponse = await axios.post(this.tryOnApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.tryOnApiKey}`
        },
        responseType: 'arraybuffer'
      });
      
      // Clean up temporary files
      fs.unlinkSync(userImagePath);
      fs.unlinkSync(productImagePath);
      
      // Upload the result to file service
      const resultImagePath = path.join(tempDir, `result_${Date.now()}.jpg`);
      fs.writeFileSync(resultImagePath, tryOnResponse.data);
      
      // Upload to file service
      const fileResult = await this.fileService_.upload({
        path: resultImagePath,
        originalname: `try_on_result_${Date.now()}.jpg`,
        mimetype: 'image/jpeg'
      });
      
      // Clean up result file
      fs.unlinkSync(resultImagePath);
      
      return fileResult.id;
      
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate try-on image: ${error.message}`
      );
    }
  }

  /**
   * Mocks AI try-on generation for development/testing
   * @param {String} userImageUrl - URL of the user image
   * @param {String} productImageUrl - URL of the product image
   * @returns {Promise<String>} ID of the mocked result image
   */
  async mockTryOnGeneration(userImageUrl, productImageUrl) {
    try {
      // For mock implementation, just return the product image as the result
      // In a real implementation, this would combine the images or call an AI service
      
      // Download the product image
      const productImageResponse = await axios.get(productImageUrl, { responseType: 'arraybuffer' });
      
      // Create a temporary file
      const tempDir = path.join(__dirname, '..', '..', 'uploads', 'temp');
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const resultImagePath = path.join(tempDir, `mock_result_${Date.now()}.jpg`);
      fs.writeFileSync(resultImagePath, productImageResponse.data);
      
      // Add a delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Upload to file service
      const fileResult = await this.fileService_.upload({
        path: resultImagePath,
        originalname: `try_on_result_${Date.now()}.jpg`,
        mimetype: 'image/jpeg'
      });
      
      // Clean up result file
      fs.unlinkSync(resultImagePath);
      
      return fileResult.id;
      
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to mock try-on image: ${error.message}`
      );
    }
  }

  /**
   * Gets the complete try-on with all related information
   * @param {String} tryOnId - Virtual try-on ID
   * @returns {Promise<Object>} Complete try-on information
   */
  async getComplete(tryOnId) {
    const virtualTryOn = await this.retrieve(tryOnId);
    
    // Get related entities
    const [product, userImage, resultImage] = await Promise.all([
      this.productService_.retrieve(virtualTryOn.product_id, {
        relations: ['images']
      }),
      this.fileService_.getFile(virtualTryOn.user_image_id),
      virtualTryOn.result_image_id
        ? this.fileService_.getFile(virtualTryOn.result_image_id)
        : null
    ]);
    
    return {
      id: virtualTryOn.id,
      status: virtualTryOn.status,
      created_at: virtualTryOn.created_at,
      updated_at: virtualTryOn.updated_at,
      product: {
        id: product.id,
        title: product.title,
        thumbnail: product.images && product.images.length > 0
          ? product.images[0].url
          : null
      },
      user_image: {
        id: userImage.id,
        url: userImage.url
      },
      result_image: resultImage
        ? {
            id: resultImage.id,
            url: resultImage.url
          }
        : null,
      metadata: virtualTryOn.metadata
    };
  }

  /**
   * Gets popular products for virtual try-on
   * @param {Number} limit - Number of products to return
   * @returns {Promise<Array>} Popular products for try-on
   */
  async getPopularTryOnProducts(limit = 10) {
    // Get count of try-ons for each product
    const virtualTryOnRepo = this.manager_.getCustomRepository(this.virtualTryOnRepository_);
    
    // Group by product_id and count
    const productCounts = await virtualTryOnRepo
      .createQueryBuilder('virtual_try_on')
      .select('virtual_try_on.product_id', 'product_id')
      .addSelect('COUNT(*)', 'count')
      .where('virtual_try_on.deleted_at IS NULL')
      .groupBy('virtual_try_on.product_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
    
    // Get product details
    const products = [];
    
    for (const { product_id } of productCounts) {
      try {
        const product = await this.productService_.retrieve(product_id, {
          relations: ['images']
        });
        
        products.push(product);
      } catch (error) {
        // Skip if product not found
        continue;
      }
    }
    
    return products;
  }

  /**
   * Gets success rate statistics for try-on service
   * @returns {Promise<Object>} Success rate statistics
   */
  async getSuccessRateStats() {
    const virtualTryOnRepo = this.manager_.getCustomRepository(this.virtualTryOnRepository_);
    
    // Get counts by status
    const totalCount = await virtualTryOnRepo.count({
      where: { deleted_at: null }
    });
    
    const completedCount = await virtualTryOnRepo.count({
      where: { status: 'completed', deleted_at: null }
    });
    
    const failedCount = await virtualTryOnRepo.count({
      where: { status: 'failed', deleted_at: null }
    });
    
    const processingCount = await virtualTryOnRepo.count({
      where: { status: 'processing', deleted_at: null }
    });
    
    const pendingCount = await virtualTryOnRepo.count({
      where: { status: 'pending', deleted_at: null }
    });
    
    const successRate = totalCount > 0
      ? (completedCount / totalCount) * 100
      : 0;
    
    return {
      total: totalCount,
      completed: completedCount,
      failed: failedCount,
      processing: processingCount,
      pending: pendingCount,
      success_rate: successRate
    };
  }
}

export default VirtualTryOnService;
