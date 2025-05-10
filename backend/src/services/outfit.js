// Outfit Service Implementation for Casual Chic Boutique 2.0

import { BaseService } from "medusa-interfaces";
import { MedusaError } from "medusa-core-utils";

class OutfitService extends BaseService {
  constructor(container) {
    super();
    
    this.outfitRepository_ = container.outfitRepository;
    this.productService_ = container.productService;
    this.customerService_ = container.customerService;
    this.eventBus_ = container.eventBusService;
  }

  /**
   * Creates a new outfit
   * @param {Object} data - Outfit data
   * @returns {Promise<Object>} Created outfit
   */
  async create(data) {
    return this.atomicPhase_(async (manager) => {
      const outfitRepo = manager.getCustomRepository(this.outfitRepository_);
      
      // Validate required fields
      const { name, products, created_by } = data;
      
      if (!name) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Outfit name is required"
        );
      }
      
      if (!products || !Array.isArray(products) || products.length === 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Outfit must contain at least one product"
        );
      }
      
      // Verify user exists if created_by is provided
      if (created_by) {
        try {
          await this.customerService_.retrieve(created_by);
        } catch (error) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            "User not found"
          );
        }
      }
      
      // Verify all products exist
      const productIds = products.map(p => p.id);
      const foundProducts = await this.productService_.list({
        id: productIds
      });
      
      if (foundProducts.length !== productIds.length) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "One or more products in the outfit do not exist"
        );
      }
      
      // Create the outfit
      const outfit = outfitRepo.create({
        name,
        description: data.description || null,
        products: foundProducts,
        thumbnail: data.thumbnail || null,
        created_by,
        metadata: data.metadata || {}
      });
      
      const result = await outfitRepo.save(outfit);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("outfit.created", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Updates an outfit
   * @param {String} id - Outfit ID
   * @param {Object} update - Update data
   * @returns {Promise<Object>} Updated outfit
   */
  async update(id, update) {
    return this.atomicPhase_(async (manager) => {
      const outfitRepo = manager.getCustomRepository(this.outfitRepository_);
      
      // Get existing outfit
      const outfit = await this.retrieve(id, { relations: ['products'] });
      
      // Check if user has permission to update (if created_by is set)
      if (outfit.created_by && update.updated_by && outfit.created_by !== update.updated_by) {
        const isAdmin = update.metadata?.is_admin === true;
        
        if (!isAdmin) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "You do not have permission to update this outfit"
          );
        }
      }
      
      // Update basic fields
      if (update.name) {
        outfit.name = update.name;
      }
      
      if (update.description !== undefined) {
        outfit.description = update.description;
      }
      
      if (update.thumbnail !== undefined) {
        outfit.thumbnail = update.thumbnail;
      }
      
      // Update products if provided
      if (update.products) {
        if (!Array.isArray(update.products) || update.products.length === 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Outfit must contain at least one product"
          );
        }
        
        // Verify all products exist
        const productIds = update.products.map(p => p.id);
        const foundProducts = await this.productService_.list({
          id: productIds
        });
        
        if (foundProducts.length !== productIds.length) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "One or more products in the outfit do not exist"
          );
        }
        
        outfit.products = foundProducts;
      }
      
      // Update metadata
      if (update.metadata) {
        outfit.metadata = {
          ...outfit.metadata,
          ...update.metadata
        };
      }
      
      const result = await outfitRepo.save(outfit);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("outfit.updated", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Retrieves an outfit by ID
   * @param {String} id - Outfit ID
   * @param {Object} config - Configuration options
   * @returns {Promise<Object>} Outfit
   */
  async retrieve(id, config = {}) {
    const outfitRepo = this.manager_.getCustomRepository(this.outfitRepository_);

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

    const query = buildQuery({ id }, config);

    const outfit = await outfitRepo.findOne(query);

    if (!outfit) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Outfit with id: ${id} was not found`
      );
    }

    return outfit;
  }

  /**
   * Lists outfits based on selector
   * @param {Object} selector - Selector criteria
   * @param {Object} config - Configuration options
   * @returns {Promise<Array>} Outfits matching criteria
   */
  async list(selector = {}, config = {}) {
    const outfitRepo = this.manager_.getCustomRepository(this.outfitRepository_);

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

    return await outfitRepo.find(query);
  }

  /**
   * Deletes an outfit
   * @param {String} id - Outfit ID
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Deleted outfit
   */
  async delete(id, context = {}) {
    return this.atomicPhase_(async (manager) => {
      const outfitRepo = manager.getCustomRepository(this.outfitRepository_);
      
      // Get existing outfit
      const outfit = await this.retrieve(id);
      
      // Check if user has permission to delete (if created_by is set)
      if (outfit.created_by && context.user_id && outfit.created_by !== context.user_id) {
        const isAdmin = context.is_admin === true;
        
        if (!isAdmin) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "You do not have permission to delete this outfit"
          );
        }
      }
      
      // Soft delete
      outfit.deleted_at = new Date();
      
      const result = await outfitRepo.save(outfit);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("outfit.deleted", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Gets outfits created by a specific user
   * @param {String} userId - User ID
   * @param {Object} config - Configuration options
   * @returns {Promise<Array>} Outfits created by the user
   */
  async listByUser(userId, config = {}) {
    return this.list({ created_by: userId }, config);
  }

  /**
   * Finds outfits containing a specific product
   * @param {String} productId - Product ID
   * @param {Object} config - Configuration options
   * @returns {Promise<Array>} Outfits containing the product
   */
  async findOutfitsWithProduct(productId, config = {}) {
    const outfitRepo = this.manager_.getCustomRepository(this.outfitRepository_);
    
    // This query needs to be adjusted based on the actual relationship setup
    const query = {
      where: {},
      relations: ['products'],
      ...config
    };
    
    const outfits = await outfitRepo.find(query);
    
    // Filter outfits containing the product
    return outfits.filter(outfit => 
      outfit.products.some(product => product.id === productId)
    );
  }

  /**
   * Gets outfits by popularity (most viewed, shared, or saved)
   * @param {Number} limit - Number of outfits to return
   * @returns {Promise<Array>} Popular outfits
   */
  async getPopularOutfits(limit = 10) {
    const outfitRepo = this.manager_.getCustomRepository(this.outfitRepository_);
    
    // This would typically use analytics data, view counts, etc.
    // For simplicity, we'll just return the most recent outfits here
    return await outfitRepo.find({
      relations: ['products'],
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * Adds a product to an outfit
   * @param {String} outfitId - Outfit ID
   * @param {String} productId - Product ID to add
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Updated outfit
   */
  async addProduct(outfitId, productId, context = {}) {
    return this.atomicPhase_(async (manager) => {
      // Get outfit with products relation
      const outfit = await this.retrieve(outfitId, { relations: ['products'] });
      
      // Check if user has permission to update (if created_by is set)
      if (outfit.created_by && context.user_id && outfit.created_by !== context.user_id) {
        const isAdmin = context.is_admin === true;
        
        if (!isAdmin) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "You do not have permission to update this outfit"
          );
        }
      }
      
      // Check if product already exists in outfit
      const productExists = outfit.products.some(p => p.id === productId);
      
      if (productExists) {
        return outfit; // Product already in outfit, no need to update
      }
      
      // Get the product
      const product = await this.productService_.retrieve(productId);
      
      // Add product to outfit
      outfit.products.push(product);
      
      // Save the updated outfit
      const outfitRepo = manager.getCustomRepository(this.outfitRepository_);
      const result = await outfitRepo.save(outfit);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("outfit.updated", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Removes a product from an outfit
   * @param {String} outfitId - Outfit ID
   * @param {String} productId - Product ID to remove
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Updated outfit
   */
  async removeProduct(outfitId, productId, context = {}) {
    return this.atomicPhase_(async (manager) => {
      // Get outfit with products relation
      const outfit = await this.retrieve(outfitId, { relations: ['products'] });
      
      // Check if user has permission to update (if created_by is set)
      if (outfit.created_by && context.user_id && outfit.created_by !== context.user_id) {
        const isAdmin = context.is_admin === true;
        
        if (!isAdmin) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "You do not have permission to update this outfit"
          );
        }
      }
      
      // Check if outfit will have at least one product after removal
      if (outfit.products.length <= 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Outfit must contain at least one product"
        );
      }
      
      // Remove product from outfit
      outfit.products = outfit.products.filter(p => p.id !== productId);
      
      // Save the updated outfit
      const outfitRepo = manager.getCustomRepository(this.outfitRepository_);
      const result = await outfitRepo.save(outfit);
      
      // Emit event for other services to react to
      await this.eventBus_.emit("outfit.updated", {
        id: result.id
      });
      
      return result;
    });
  }

  /**
   * Gets recommended outfits based on a product
   * @param {String} productId - Product ID to base recommendations on
   * @param {Number} limit - Number of outfits to return
   * @returns {Promise<Array>} Recommended outfits
   */
  async getRecommendedOutfits(productId, limit = 5) {
    // Get outfits containing the product
    const relatedOutfits = await this.findOutfitsWithProduct(productId);
    
    if (relatedOutfits.length === 0) {
      // If no outfits contain this product, get popular outfits instead
      return this.getPopularOutfits(limit);
    }
    
    // Get the product
    const product = await this.productService_.retrieve(productId, {
      relations: ['categories', 'tags']
    });
    
    // Get all outfits
    const allOutfits = await this.list({
      id: { $ne: relatedOutfits.map(o => o.id) } // Exclude outfits that already contain the product
    }, {
      relations: ['products']
    });
    
    // Calculate similarity scores between product and outfits
    const scoredOutfits = allOutfits.map(outfit => {
      const score = this.calculateOutfitSimilarity(outfit, product);
      return { outfit, score };
    });
    
    // Sort by score and get top recommendations
    scoredOutfits.sort((a, b) => b.score - a.score);
    
    return scoredOutfits.slice(0, limit).map(item => item.outfit);
  }

  /**
   * Calculates similarity between an outfit and a product
   * @param {Object} outfit - Outfit
   * @param {Object} product - Product
   * @returns {Number} Similarity score (0-100)
   */
  calculateOutfitSimilarity(outfit, product) {
    let score = 0;

    // Verify both objects have the required data
    if (!outfit || !outfit.products || !product) {
      return 0; // Early return if data is missing
    }

    // Get categories and tags from product
    const productCategories = product.categories ? product.categories.map(c => c.id) : [];
    const productTags = product.tags ? product.tags.map(t => t.id) : [];

    // Early return if product has no tags or categories
    if (productCategories.length === 0 && productTags.length === 0) {
      return 10; // Give a minimal base score
    }

    // Calculate score based on shared categories and tags with products in the outfit
    let validProductCount = 0;

    for (const outfitProduct of outfit.products) {
      // Skip if this is the same product
      if (outfitProduct.id === product.id) {
        continue;
      }

      // Skip if outfit product doesn't have categories or tags loaded
      if (!outfitProduct.categories && !outfitProduct.tags) {
        continue;
      }

      validProductCount++;

      // Get categories and tags for outfit product
      const outfitProductCategories = outfitProduct.categories
        ? outfitProduct.categories.map(c => c.id)
        : [];

      const outfitProductTags = outfitProduct.tags
        ? outfitProduct.tags.map(t => t.id)
        : [];

      // Count matching categories
      const sharedCategories = outfitProductCategories.filter(id =>
        productCategories.includes(id)
      ).length;

      // Count matching tags
      const sharedTags = outfitProductTags.filter(id =>
        productTags.includes(id)
      ).length;

      // Award points for matching categories and tags
      if (productCategories.length > 0 && outfitProductCategories.length > 0) {
        score += (sharedCategories / Math.max(productCategories.length, outfitProductCategories.length)) * 40;
      }

      if (productTags.length > 0 && outfitProductTags.length > 0) {
        score += (sharedTags / Math.max(productTags.length, outfitProductTags.length)) * 60;
      }
    }

    // Normalize score based on number of valid products in outfit
    if (validProductCount > 0) {
      score = score / validProductCount;
    } else {
      // If no valid products were found for comparison, assign a base score
      score = 15;
    }

    return Math.min(100, score);
  }

  /**
   * Gets complete outfit details with product information
   * @param {String} outfitId - Outfit ID
   * @returns {Promise<Object>} Complete outfit details
   */
  async getComplete(outfitId) {
    const outfit = await this.retrieve(outfitId, {
      relations: ['products', 'products.variants', 'products.images', 'products.tags', 'products.categories']
    });
    
    // You could add additional information here like:
    // - Total price of the outfit
    // - Style categorization
    // - Occasion suitability
    
    const totalPrice = outfit.products.reduce((sum, product) => {
      // Get the default variant price
      const defaultVariant = product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;
      
      const price = defaultVariant && defaultVariant.prices && defaultVariant.prices.length > 0
        ? defaultVariant.prices[0].amount
        : 0;
      
      return sum + price;
    }, 0);
    
    return {
      ...outfit,
      total_price: totalPrice,
      product_count: outfit.products.length
    };
  }
}

export default OutfitService;