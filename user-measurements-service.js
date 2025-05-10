// User Measurements Service Implementation for Casual Chic Boutique 2.0

// backend/src/services/user-measurement.js

import { BaseService } from "medusa-interfaces";
import { MedusaError } from "medusa-core-utils";

class UserMeasurementService extends BaseService {
  constructor(container) {
    super();
    
    this.userMeasurementRepository_ = container.userMeasurementRepository;
    this.customerService_ = container.customerService;
    this.eventBus_ = container.eventBusService;
  }

  /**
   * Creates a user measurement record
   * @param {Object} data - User measurement data
   * @returns {Promise<Object>} Created user measurement
   */
  async create(data) {
    return this.atomicPhase_(async (manager) => {
      const userMeasurementRepo = manager.getCustomRepository(this.userMeasurementRepository_);
      
      // Validate required fields
      const { user_id } = data;
      
      if (!user_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "User ID is required"
        );
      }
      
      // Verify that user exists
      try {
        await this.customerService_.retrieve(user_id);
      } catch (error) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "User not found"
        );
      }
      
      // Check if measurements already exist for this user
      const existing = await userMeasurementRepo.findOne({
        where: { user_id }
      });
      
      if (existing) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          "Measurements already exist for this user. Use update instead."
        );
      }
      
      // Validate measurement values (if provided)
      this.validateMeasurementValues(data);
      
      // Create the user measurement
      const userMeasurement = userMeasurementRepo.create({
        user_id,
        height: data.height || null,
        weight: data.weight || null,
        bust: data.bust || null,
        waist: data.waist || null,
        hips: data.hips || null,
        shoulder_width: data.shoulder_width || null,
        inseam: data.inseam || null,
        metadata: data.metadata || {}
      });
      
      const result = await userMeasurementRepo.save(userMeasurement);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("user_measurement.created", {
        id: result.id,
        user_id: result.user_id
      });
      
      return result;
    });
  }

  /**
   * Updates user measurements
   * @param {String} id - Measurement ID
   * @param {Object} update - Update data
   * @returns {Promise<Object>} Updated user measurement
   */
  async update(id, update) {
    return this.atomicPhase_(async (manager) => {
      const userMeasurementRepo = manager.getCustomRepository(this.userMeasurementRepository_);
      
      // Get existing record
      const userMeasurement = await this.retrieve(id);
      
      // Validate measurement values (if provided)
      this.validateMeasurementValues(update);
      
      // Update fields
      const {
        height,
        weight,
        bust,
        waist,
        hips,
        shoulder_width,
        inseam,
        metadata
      } = update;
      
      if (height !== undefined) {
        userMeasurement.height = height;
      }
      
      if (weight !== undefined) {
        userMeasurement.weight = weight;
      }
      
      if (bust !== undefined) {
        userMeasurement.bust = bust;
      }
      
      if (waist !== undefined) {
        userMeasurement.waist = waist;
      }
      
      if (hips !== undefined) {
        userMeasurement.hips = hips;
      }
      
      if (shoulder_width !== undefined) {
        userMeasurement.shoulder_width = shoulder_width;
      }
      
      if (inseam !== undefined) {
        userMeasurement.inseam = inseam;
      }
      
      if (metadata) {
        userMeasurement.metadata = {
          ...userMeasurement.metadata,
          ...metadata
        };
      }
      
      const result = await userMeasurementRepo.save(userMeasurement);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("user_measurement.updated", {
        id: result.id,
        user_id: result.user_id
      });
      
      return result;
    });
  }

  /**
   * Creates or updates user measurements
   * @param {Object} data - User measurement data
   * @returns {Promise<Object>} Created or updated user measurement
   */
  async upsert(data) {
    return this.atomicPhase_(async (manager) => {
      const userMeasurementRepo = manager.getCustomRepository(this.userMeasurementRepository_);
      
      // Validate required fields
      const { user_id } = data;
      
      if (!user_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "User ID is required"
        );
      }
      
      // Check if measurements already exist for this user
      const existing = await userMeasurementRepo.findOne({
        where: { user_id }
      });
      
      if (existing) {
        // Update existing record
        return this.update(existing.id, data);
      } else {
        // Create new record
        return this.create(data);
      }
    });
  }

  /**
   * Retrieves user measurements by ID
   * @param {String} id - Measurement ID
   * @param {Object} config - Configuration
   * @returns {Promise<Object>} User measurement
   */
  async retrieve(id, config = {}) {
    const userMeasurementRepo = this.manager_.getCustomRepository(this.userMeasurementRepository_);
    
    const userMeasurement = await userMeasurementRepo.findOne({
      where: { id },
      ...config
    });
    
    if (!userMeasurement) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `User measurement with id: ${id} was not found`
      );
    }
    
    return userMeasurement;
  }

  /**
   * Retrieves user measurements by user ID
   * @param {String} userId - User ID
   * @param {Object} config - Configuration
   * @returns {Promise<Object>} User measurement
   */
  async retrieveByUser(userId, config = {}) {
    const userMeasurementRepo = this.manager_.getCustomRepository(this.userMeasurementRepository_);
    
    const userMeasurement = await userMeasurementRepo.findOne({
      where: { user_id: userId },
      ...config
    });
    
    if (!userMeasurement) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `User measurement for user: ${userId} was not found`
      );
    }
    
    return userMeasurement;
  }

  /**
   * Lists user measurements based on selector
   * @param {Object} selector - Selector for filtering
   * @param {Object} config - Configuration
   * @returns {Promise<Array>} Array of user measurements
   */
  async list(selector, config = {}) {
    const userMeasurementRepo = this.manager_.getCustomRepository(this.userMeasurementRepository_);

    // Helper function to build query with filters and relations
    const buildQuery = (selector, config = {}) => {
      const { relations, ...options } = config;

      const query = {
        where: selector,
        ...options
      };

      if (relations && relations.length > 0) {
        query.relations = relations;
      }

      return query;
    };

    const query = buildQuery(selector, config);

    return await userMeasurementRepo.find(query);
  }

  /**
   * Deletes user measurements
   * @param {String} id - Measurement ID
   * @returns {Promise<Object>} Deleted user measurement
   */
  async delete(id) {
    return this.atomicPhase_(async (manager) => {
      const userMeasurementRepo = manager.getCustomRepository(this.userMeasurementRepository_);
      
      // Get existing record
      const userMeasurement = await this.retrieve(id);
      
      // Soft delete
      userMeasurement.deleted_at = new Date();
      
      const result = await userMeasurementRepo.save(userMeasurement);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("user_measurement.deleted", {
        id: result.id,
        user_id: result.user_id
      });
      
      return result;
    });
  }

  /**
   * Validates measurement values
   * @param {Object} data - Measurement data
   * @throws {MedusaError} If validation fails
   */
  validateMeasurementValues(data) {
    const numericFields = [
      'height',
      'weight',
      'bust',
      'waist',
      'hips',
      'shoulder_width',
      'inseam'
    ];
    
    // Validate numeric fields
    for (const field of numericFields) {
      if (data[field] !== undefined && data[field] !== null) {
        const value = data[field];
        
        // Check if it's a number and positive
        if (isNaN(value) || value <= 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `${field} must be a positive number`
          );
        }
        
        // Check reasonable ranges based on field
        switch (field) {
          case 'height':
            // Height in cm (assuming adults)
            if (value < 140 || value > 220) {
              throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Height value seems unusual. Please check the measurement (expected cm).`
              );
            }
            break;
            
          case 'weight':
            // Weight in kg (assuming adults)
            if (value < 40 || value > 150) {
              throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Weight value seems unusual. Please check the measurement (expected kg).`
              );
            }
            break;
            
          case 'bust':
          case 'waist':
          case 'hips':
            // Circumference measurements (reasonable adult ranges in cm)
            if (value < 50 || value > 150) {
              throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `${field} value seems unusual. Please check the measurement (expected cm).`
              );
            }
            break;
            
          case 'shoulder_width':
            // Shoulder width (reasonable adult ranges in cm)
            if (value < 30 || value > 60) {
              throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Shoulder width value seems unusual. Please check the measurement (expected cm).`
              );
            }
            break;
            
          case 'inseam':
            // Inseam (reasonable adult ranges in cm)
            if (value < 60 || value > 100) {
              throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Inseam value seems unusual. Please check the measurement (expected cm).`
              );
            }
            break;
        }
      }
    }
  }

  /**
   * Gets size recommendation based on user's measurements
   * @param {String} userId - User ID
   * @param {String} productId - Product ID
   * @returns {Promise<Object>} Size recommendation
   */
  async getSizeRecommendation(userId, productId) {
    const userMeasurement = await this.retrieveByUser(userId);

    // Use SizeRecommendationService to get recommendation
    const sizeRecommendationService = this.container.sizeRecommendationService;

    if (!sizeRecommendationService) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Size recommendation service not initialized"
      );
    }

    return sizeRecommendationService.getRecommendationByUser(productId, userId);
  }
}

export default UserMeasurementService;
