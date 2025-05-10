// Style Profile Service Implementation for Casual Chic Boutique 2.0

// backend/src/services/style-profile.js

import { BaseService } from "medusa-interfaces";
import { MedusaError } from "medusa-core-utils";

class StyleProfileService extends BaseService {
  constructor(container) {
    super();
    
    this.styleProfileRepository_ = container.styleProfileRepository;
    this.customerService_ = container.customerService;
    this.productService_ = container.productService;
    this.eventBus_ = container.eventBusService;
    
    // Style categories and options for validation
    this.styleOptions = [
      'casual', 'bohemian', 'minimalist', 'streetwear', 
      'preppy', 'vintage', 'athleisure', 'elegant', 
      'romantic', 'grunge', 'business', 'artsy'
    ];
    
    this.colorOptions = [
      'black', 'white', 'navy', 'beige', 'pastel', 
      'olive', 'burgundy', 'mustard', 'emerald', 'lavender',
      'red', 'blue', 'green', 'yellow', 'orange', 
      'purple', 'pink', 'brown', 'gray', 'metallic'
    ];
    
    this.occasionOptions = [
      'casual', 'office', 'evening', 'formal', 
      'active', 'vacation', 'party', 'date', 
      'outdoor', 'wedding', 'interview', 'weekend'
    ];
  }

  /**
   * Creates a style profile for a user
   * @param {Object} data - Style profile data
   * @returns {Promise<Object>} Created style profile
   */
  async create(data) {
    return this.atomicPhase_(async (manager) => {
      const styleProfileRepo = manager.getCustomRepository(this.styleProfileRepository_);
      
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
      
      // Check if style profile already exists for this user
      const existing = await styleProfileRepo.findOne({
        where: { user_id }
      });
      
      if (existing) {
        throw new MedusaError(
          MedusaError.Types.DUPLICATE_ERROR,
          "Style profile already exists for this user. Use update instead."
        );
      }
      
      // Validate style preferences
      this.validateStylePreferences(data);
      
      // Create the style profile
      const styleProfile = styleProfileRepo.create({
        user_id,
        preferred_styles: data.preferred_styles || [],
        preferred_colors: data.preferred_colors || [],
        preferred_occasions: data.preferred_occasions || [],
        disliked_styles: data.disliked_styles || [],
        disliked_colors: data.disliked_colors || [],
        size_preferences: data.size_preferences || {},
        metadata: data.metadata || {}
      });
      
      const result = await styleProfileRepo.save(styleProfile);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("style_profile.created", {
        id: result.id,
        user_id: result.user_id
      });
      
      return result;
    });
  }

  /**
   * Updates a style profile
   * @param {String} id - Style profile ID
   * @param {Object} update - Update data
   * @returns {Promise<Object>} Updated style profile
   */
  async update(id, update) {
    return this.atomicPhase_(async (manager) => {
      const styleProfileRepo = manager.getCustomRepository(this.styleProfileRepository_);
      
      // Get existing record
      const styleProfile = await this.retrieve(id);
      
      // Validate style preferences
      this.validateStylePreferences(update);
      
      // Update fields
      const {
        preferred_styles,
        preferred_colors,
        preferred_occasions,
        disliked_styles,
        disliked_colors,
        size_preferences,
        metadata
      } = update;
      
      if (preferred_styles !== undefined) {
        styleProfile.preferred_styles = preferred_styles;
      }
      
      if (preferred_colors !== undefined) {
        styleProfile.preferred_colors = preferred_colors;
      }
      
      if (preferred_occasions !== undefined) {
        styleProfile.preferred_occasions = preferred_occasions;
      }
      
      if (disliked_styles !== undefined) {
        styleProfile.disliked_styles = disliked_styles;
      }
      
      if (disliked_colors !== undefined) {
        styleProfile.disliked_colors = disliked_colors;
      }
      
      if (size_preferences !== undefined) {
        styleProfile.size_preferences = size_preferences;
      }
      
      if (metadata) {
        styleProfile.metadata = {
          ...styleProfile.metadata,
          ...metadata
        };
      }
      
      const result = await styleProfileRepo.save(styleProfile);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("style_profile.updated", {
        id: result.id,
        user_id: result.user_id
      });
      
      return result;
    });
  }

  /**
   * Creates or updates a style profile
   * @param {Object} data - Style profile data
   * @returns {Promise<Object>} Created or updated style profile
   */
  async upsert(data) {
    return this.atomicPhase_(async (manager) => {
      const styleProfileRepo = manager.getCustomRepository(this.styleProfileRepository_);
      
      // Validate required fields
      const { user_id } = data;
      
      if (!user_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "User ID is required"
        );
      }
      
      // Check if style profile already exists for this user
      const existing = await styleProfileRepo.findOne({
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
   * Retrieves a style profile by ID
   * @param {String} id - Style profile ID
   * @param {Object} config - Configuration
   * @returns {Promise<Object>} Style profile
   */
  async retrieve(id, config = {}) {
    const styleProfileRepo = this.manager_.getCustomRepository(this.styleProfileRepository_);
    
    const styleProfile = await styleProfileRepo.findOne({
      where: { id },
      ...config
    });
    
    if (!styleProfile) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Style profile with id: ${id} was not found`
      );
    }
    
    return styleProfile;
  }

  /**
   * Retrieves a style profile by user ID
   * @param {String} userId - User ID
   * @param {Object} config - Configuration
   * @returns {Promise<Object>} Style profile
   */
  async retrieveByUser(userId, config = {}) {
    const styleProfileRepo = this.manager_.getCustomRepository(this.styleProfileRepository_);
    
    const styleProfile = await styleProfileRepo.findOne({
      where: { user_id: userId },
      ...config
    });
    
    if (!styleProfile) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Style profile for user: ${userId} was not found`
      );
    }
    
    return styleProfile;
  }

  /**
   * Lists style profiles based on selector
   * @param {Object} selector - Selector for filtering
   * @param {Object} config - Configuration
   * @returns {Promise<Array>} Array of style profiles
   */
  async list(selector, config = {}) {
    const styleProfileRepo = this.manager_.getCustomRepository(this.styleProfileRepository_);
    
    const query = buildQuery(selector, config);
    
    return await styleProfileRepo.find(query);
  }

  /**
   * Deletes a style profile
   * @param {String} id - Style profile ID
   * @returns {Promise<Object>} Deleted style profile
   */
  async delete(id) {
    return this.atomicPhase_(async (manager) => {
      const styleProfileRepo = manager.getCustomRepository(this.styleProfileRepository_);
      
      // Get existing record
      const styleProfile = await this.retrieve(id);
      
      // Soft delete
      styleProfile.deleted_at = new Date();
      
      const result = await styleProfileRepo.save(styleProfile);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("style_profile.deleted", {
        id: result.id,
        user_id: result.user_id
      });
      
      return result;
    });
  }

  /**
   * Validates style preferences data
   * @param {Object} data - Style profile data
   * @throws {MedusaError} If validation fails
   */
  validateStylePreferences(data) {
    // Validate array fields
    const arrayFields = [
      { name: 'preferred_styles', options: this.styleOptions },
      { name: 'preferred_colors', options: this.colorOptions },
      { name: 'preferred_occasions', options: this.occasionOptions },
      { name: 'disliked_styles', options: this.styleOptions },
      { name: 'disliked_colors', options: this.colorOptions }
    ];
    
    for (const field of arrayFields) {
      if (data[field.name] !== undefined) {
        if (!Array.isArray(data[field.name])) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `${field.name} must be an array`
          );
        }
        
        // Check that all values are in the allowed options
        for (const value of data[field.name]) {
          if (!field.options.includes(value.toLowerCase())) {
            throw new MedusaError(
              MedusaError.Types.INVALID_DATA,
              `Invalid value "${value}" for ${field.name}. Allowed values: ${field.options.join(', ')}`
            );
          }
        }
      }
    }
    
    // Validate size preferences if provided
    if (data.size_preferences !== undefined) {
      if (typeof data.size_preferences !== 'object' || data.size_preferences === null) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `size_preferences must be an object`
        );
      }
      
      // Validate size categories
      const allowedSizeCategories = ['tops', 'bottoms', 'dresses', 'shoes'];
      
      for (const [category, size] of Object.entries(data.size_preferences)) {
        if (!allowedSizeCategories.includes(category)) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Invalid size category "${category}". Allowed categories: ${allowedSizeCategories.join(', ')}`
          );
        }
        
        // Validate size values based on category
        this.validateSizeValue(category, size);
      }
    }
  }

  /**
   * Validates a size value for a specific category
   * @param {String} category - Size category (tops, bottoms, etc.)
   * @param {String} size - Size value
   * @throws {MedusaError} If validation fails
   */
  validateSizeValue(category, size) {
    const sizeOptions = {
      'tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      'bottoms': ['0', '2', '4', '6', '8', '10', '12', '14', '16'],
      'dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      'shoes': ['5', '6', '7', '8', '9', '10', '11']
    };
    
    if (!sizeOptions[category].includes(size.toString().toUpperCase())) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid size "${size}" for category "${category}". Allowed sizes: ${sizeOptions[category].join(', ')}`
      );
    }
  }

  /**
   * Generates product recommendations based on style profile
   * @param {Object} profile - Style profile
   * @param {Object} options - Options for recommendations
   * @returns {Promise<Array>} Recommended products with scores
   */
  async generateRecommendations(profile, options = {}) {
    try {
      const limit = options.limit || 10;
      
      // Get all products (in a real implementation, this would use pagination)
      const products = await this.productService_.list({}, {
        relations: ['tags', 'categories']
      });
      
      // Calculate match score for each product
      const recommendations = [];
      
      for (const product of products) {
        const score = this.calculateProductMatch(product, profile);
        
        if (score > 0) {
          recommendations.push({
            product_id: product.id,
            product: product,
            score: score
          });
        }
      }
      
      // Sort by score (highest first) and limit results
      recommendations.sort((a, b) => b.score - a.score);
      return recommendations.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculates how well a product matches a style profile
   * @param {Object} product - Product to match
   * @param {Object} profile - Style profile
   * @returns {Number} Match score (0-100)
   */
  calculateProductMatch(product, profile) {
    let score = 0;
    const productMetadata = product.metadata || {};
    const tags = product.tags ? product.tags.map(t => t.value.toLowerCase()) : [];
    const categories = product.categories ? product.categories.map(c => c.name.toLowerCase()) : [];
    
    // Extract style information from product
    const productStyles = [
      ...(productMetadata.style_tags || []),
      ...tags.filter(tag => this.styleOptions.includes(tag))
    ];
    
    const productColors = [
      ...(productMetadata.colors || []),
      ...tags.filter(tag => this.colorOptions.includes(tag))
    ];
    
    const productOccasions = [
      ...(productMetadata.occasion_tags || []),
      ...tags.filter(tag => this.occasionOptions.includes(tag))
    ];
    
    // Match preferred styles (30% of score)
    if (profile.preferred_styles && profile.preferred_styles.length > 0) {
      const styleMatches = productStyles.filter(style => 
        profile.preferred_styles.includes(style.toLowerCase())
      ).length;
      
      if (productStyles.length > 0) {
        score += (styleMatches / productStyles.length) * 30;
      }
    }
    
    // Match preferred colors (25% of score)
    if (profile.preferred_colors && profile.preferred_colors.length > 0) {
      const colorMatches = productColors.filter(color => 
        profile.preferred_colors.includes(color.toLowerCase())
      ).length;
      
      if (productColors.length > 0) {
        score += (colorMatches / productColors.length) * 25;
      }
    }
    
    // Match preferred occasions (20% of score)
    if (profile.preferred_occasions && profile.preferred_occasions.length > 0) {
      const occasionMatches = productOccasions.filter(occasion => 
        profile.preferred_occasions.includes(occasion.toLowerCase())
      ).length;
      
      if (productOccasions.length > 0) {
        score += (occasionMatches / productOccasions.length) * 20;
      }
    }
    
    // Check for disliked styles (negative impact)
    if (profile.disliked_styles && profile.disliked_styles.length > 0) {
      const dislikedStyleMatches = productStyles.filter(style => 
        profile.disliked_styles.includes(style.toLowerCase())
      ).length;
      
      if (productStyles.length > 0 && dislikedStyleMatches > 0) {
        score -= (dislikedStyleMatches / productStyles.length) * 40;
      }
    }
    
    // Check for disliked colors (negative impact)
    if (profile.disliked_colors && profile.disliked_colors.length > 0) {
      const dislikedColorMatches = productColors.filter(color => 
        profile.disliked_colors.includes(color.toLowerCase())
      ).length;
      
      if (productColors.length > 0 && dislikedColorMatches > 0) {
        score -= (dislikedColorMatches / productColors.length) * 30;
      }
    }
    
    // Check size preferences (25% of score)
    if (profile.size_preferences && Object.keys(profile.size_preferences).length > 0) {
      const productType = this.determineProductType(product);
      
      if (productType && profile.size_preferences[productType]) {
        // Product has a matching size in the user's preferred sizes
        if (this.productHasSize(product, profile.size_preferences[productType])) {
          score += 25;
        }
      }
    }
    
    // Normalize score to 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determines product type (tops, bottoms, dresses, shoes)
   * @param {Object} product - Product
   * @returns {String|null} Product type or null if can't determine
   */
  determineProductType(product) {
    const categories = product.categories ? product.categories.map(c => c.name.toLowerCase()) : [];
    const tags = product.tags ? product.tags.map(t => t.value.toLowerCase()) : [];
    const title = product.title ? product.title.toLowerCase() : '';
    const metadata = product.metadata || {};
    
    if (metadata.product_type) {
      return metadata.product_type.toLowerCase();
    }
    
    // Check categories
    if (
      categories.includes('tops') || 
      categories.includes('shirts') || 
      categories.includes('blouses') ||
      categories.includes('t-shirts') ||
      categories.includes('sweaters')
    ) {
      return 'tops';
    }
    
    if (
      categories.includes('bottoms') || 
      categories.includes('pants') || 
      categories.includes('skirts') ||
      categories.includes('shorts') ||
      categories.includes('jeans')
    ) {
      return 'bottoms';
    }
    
    if (
      categories.includes('dresses') || 
      categories.includes('jumpsuits') || 
      categories.includes('rompers')
    ) {
      return 'dresses';
    }
    
    if (
      categories.includes('shoes') || 
      categories.includes('footwear') || 
      categories.includes('sneakers') ||
      categories.includes('boots')
    ) {
      return 'shoes';
    }
    
    // Check tags
    if (
      tags.includes('top') || 
      tags.includes('shirt') || 
      tags.includes('blouse')
    ) {
      return 'tops';
    }
    
    if (
      tags.includes('bottom') || 
      tags.includes('pant') || 
      tags.includes('skirt')
    ) {
      return 'bottoms';
    }
    
    if (
      tags.includes('dress') || 
      tags.includes('jumpsuit')
    ) {
      return 'dresses';
    }
    
    if (
      tags.includes('shoe') || 
      tags.includes('footwear')
    ) {
      return 'shoes';
    }
    
    // Check title
    if (
      title.includes('top') || 
      title.includes('shirt') || 
      title.includes('blouse') ||
      title.includes('tee')
    ) {
      return 'tops';
    }
    
    if (
      title.includes('pant') || 
      title.includes('jean') || 
      title.includes('skirt') ||
      title.includes('short')
    ) {
      return 'bottoms';
    }
    
    if (
      title.includes('dress') || 
      title.includes('jumpsuit') || 
      title.includes('romper')
    ) {
      return 'dresses';
    }
    
    if (
      title.includes('shoe') || 
      title.includes('boot') || 
      title.includes('sneaker') ||
      title.includes('footwear')
    ) {
      return 'shoes';
    }
    
    return null;
  }

  /**
   * Checks if a product has a specific size
   * @param {Object} product - Product to check
   * @param {String} size - Size to check for
   * @returns {Boolean} True if product has the size
   */
  productHasSize(product, size) {
    const variants = product.variants || [];
    
    for (const variant of variants) {
      // Check variant options
      if (variant.options && variant.options.length > 0) {
        const sizeOption = variant.options.find(
          option => option.option?.title?.toLowerCase() === 'size'
        );
        
        if (sizeOption && sizeOption.value.toUpperCase() === size.toUpperCase()) {
          return true;
        }
      }
      
      // Check variant title
      if (variant.title) {
        const sizeRegex = new RegExp(`\\b${size}\\b`, 'i');
        if (sizeRegex.test(variant.title)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

export default StyleProfileService;
