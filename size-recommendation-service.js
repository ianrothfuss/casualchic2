// Size Recommendation Service Implementation for Casual Chic Boutique 2.0

// backend/src/services/size-recommendation.js

import { BaseService } from "medusa-interfaces";
import { MedusaError } from "medusa-core-utils";

class SizeRecommendationService extends BaseService {
  constructor(container) {
    super();
    
    this.productService_ = container.productService;
    this.productVariantService_ = container.productVariantService;
    this.userMeasurementService_ = container.userMeasurementService;
    
    // Size standards mapped to measurements in cm
    this.sizeStandards = {
      tops: {
        'XS': { bust: { min: 76, max: 81 }, waist: { min: 58, max: 63 } },
        'S': { bust: { min: 82, max: 87 }, waist: { min: 64, max: 69 } },
        'M': { bust: { min: 88, max: 93 }, waist: { min: 70, max: 75 } },
        'L': { bust: { min: 94, max: 99 }, waist: { min: 76, max: 81 } },
        'XL': { bust: { min: 100, max: 107 }, waist: { min: 82, max: 89 } },
        'XXL': { bust: { min: 108, max: 119 }, waist: { min: 90, max: 101 } }
      },
      bottoms: {
        '0': { waist: { min: 58, max: 60 }, hips: { min: 83, max: 85 } },
        '2': { waist: { min: 61, max: 63 }, hips: { min: 86, max: 88 } },
        '4': { waist: { min: 64, max: 66 }, hips: { min: 89, max: 91 } },
        '6': { waist: { min: 67, max: 69 }, hips: { min: 92, max: 94 } },
        '8': { waist: { min: 70, max: 72 }, hips: { min: 95, max: 97 } },
        '10': { waist: { min: 73, max: 75 }, hips: { min: 98, max: 100 } },
        '12': { waist: { min: 76, max: 79 }, hips: { min: 101, max: 104 } },
        '14': { waist: { min: 80, max: 84 }, hips: { min: 105, max: 109 } },
        '16': { waist: { min: 85, max: 89 }, hips: { min: 110, max: 114 } }
      },
      dresses: {
        'XS': { bust: { min: 76, max: 81 }, waist: { min: 58, max: 63 }, hips: { min: 83, max: 88 } },
        'S': { bust: { min: 82, max: 87 }, waist: { min: 64, max: 69 }, hips: { min: 89, max: 94 } },
        'M': { bust: { min: 88, max: 93 }, waist: { min: 70, max: 75 }, hips: { min: 95, max: 100 } },
        'L': { bust: { min: 94, max: 99 }, waist: { min: 76, max: 81 }, hips: { min: 101, max: 106 } },
        'XL': { bust: { min: 100, max: 107 }, waist: { min: 82, max: 89 }, hips: { min: 107, max: 114 } },
        'XXL': { bust: { min: 108, max: 119 }, waist: { min: 90, max: 101 }, hips: { min: 115, max: 122 } }
      }
    };
  }

  /**
   * Get size recommendation based on product and user measurements
   * @param {Object} product - The product to get recommendation for
   * @param {Object} measurements - User's measurements
   * @returns {Object} Size recommendation with confidence score
   */
  async getRecommendation(product, measurements) {
    try {
      if (!product) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "Product not found"
        );
      }

      // Determine product type (tops, bottoms, dresses, etc.)
      const productType = this.determineProductType(product);
      
      if (!productType) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Unable to determine product type for size recommendation"
        );
      }
      
      // Get available sizes for this product
      const availableSizes = await this.getAvailableSizes(product);
      
      if (!availableSizes || availableSizes.length === 0) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "No size options available for this product"
        );
      }
      
      // Calculate best size match
      const sizeRecommendation = this.calculateBestSize(
        productType,
        measurements,
        availableSizes
      );
      
      // Calculate alternative sizes if primary recommendation is not available
      const alternativeSizes = this.calculateAlternativeSizes(
        productType,
        measurements,
        availableSizes,
        sizeRecommendation.size
      );
      
      return {
        product_id: product.id,
        recommended_size: sizeRecommendation.size,
        confidence: sizeRecommendation.confidence,
        alternatives: alternativeSizes,
        product_type: productType
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Determine product type (tops, bottoms, dresses)
   * @param {Object} product - The product
   * @returns {String} Product type
   */
  determineProductType(product) {
    // Use product categories, tags or metadata to determine type
    const categories = product.categories || [];
    const tags = product.tags || [];
    const metadata = product.metadata || {};

    // Check product type from metadata first (most reliable if set)
    if (metadata.product_type) {
      return metadata.product_type.toLowerCase();
    }

    // Check categories
    const categoryNames = categories.map(c => c.name ? c.name.toLowerCase() : '');

    if (
      categoryNames.includes('tops') ||
      categoryNames.includes('shirts') ||
      categoryNames.includes('blouses') ||
      categoryNames.includes('t-shirts') ||
      categoryNames.includes('sweaters')
    ) {
      return 'tops';
    }

    if (
      categoryNames.includes('bottoms') ||
      categoryNames.includes('pants') ||
      categoryNames.includes('skirts') ||
      categoryNames.includes('shorts') ||
      categoryNames.includes('jeans')
    ) {
      return 'bottoms';
    }

    if (
      categoryNames.includes('dresses') ||
      categoryNames.includes('jumpsuits') ||
      categoryNames.includes('rompers')
    ) {
      return 'dresses';
    }

    // Check tags
    const tagNames = tags.map(t => t.value ? t.value.toLowerCase() : '');

    if (
      tagNames.includes('top') ||
      tagNames.includes('shirt') ||
      tagNames.includes('blouse') ||
      tagNames.includes('t-shirt') ||
      tagNames.includes('sweater')
    ) {
      return 'tops';
    }

    if (
      tagNames.includes('bottom') ||
      tagNames.includes('pant') ||
      tagNames.includes('skirt') ||
      tagNames.includes('short') ||
      tagNames.includes('jean')
    ) {
      return 'bottoms';
    }

    if (
      tagNames.includes('dress') ||
      tagNames.includes('jumpsuit') ||
      tagNames.includes('romper')
    ) {
      return 'dresses';
    }

    // Check product title as fallback
    const title = product.title ? product.title.toLowerCase() : '';

    if (
      title.includes('dress') ||
      title.includes('jumpsuit') ||
      title.includes('romper')
    ) {
      return 'dresses';
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
      title.includes('top') ||
      title.includes('shirt') ||
      title.includes('blouse') ||
      title.includes('tee') ||
      title.includes('sweater')
    ) {
      return 'tops';
    }

    // Default to tops if we can't determine
    return 'tops';
  }

  /**
   * Get available sizes for a product
   * @param {Object} product - The product
   * @returns {Array} Available sizes
   */
  async getAvailableSizes(product) {
    try {
      const variants = product.variants || [];
      
      // Extract sizes from variant titles or options
      const sizes = [];
      
      for (const variant of variants) {
        let size = null;
        
        // Check variant options for size
        if (variant.options && variant.options.length > 0) {
          const sizeOption = variant.options.find(
            option => option.option?.title?.toLowerCase() === 'size'
          );
          
          if (sizeOption) {
            size = sizeOption.value;
          }
        }
        
        // If size not found in options, try to extract from variant title
        if (!size && variant.title) {
          // Try to determine if this is a letter-based size (XS, S, M, L, XL, XXL)
          const letterSizeMatch = variant.title.match(/\b(XS|S|M|L|XL|XXL)\b/i);
          if (letterSizeMatch) {
            size = letterSizeMatch[1].toUpperCase();
          } else {
            // Try to find numeric sizes (0, 2, 4, 6, 8, 10, 12, 14, 16)
            const numericSizeMatch = variant.title.match(/\b(0|2|4|6|8|10|12|14|16)\b/);
            if (numericSizeMatch) {
              size = numericSizeMatch[1];
            }
          }
        }
        
        if (size && !sizes.includes(size)) {
          sizes.push(size);
        }
      }
      
      return sizes;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate the best size match based on user measurements
   * @param {String} productType - Type of product (tops, bottoms, dresses)
   * @param {Object} measurements - User's measurements
   * @param {Array} availableSizes - Available sizes for the product
   * @returns {Object} Best size match with confidence score
   */
  calculateBestSize(productType, measurements, availableSizes) {
    const sizeStandard = this.sizeStandards[productType];
    
    if (!sizeStandard) {
      return { size: availableSizes[0], confidence: 0.5 };
    }
    
    const scores = {};
    
    // Calculate match score for each available size
    for (const size of availableSizes) {
      if (!sizeStandard[size]) {
        scores[size] = 0.5; // Default medium confidence if size not in standards
        continue;
      }
      
      const sizeSpec = sizeStandard[size];
      let totalScore = 0;
      let measurementCount = 0;
      
      // Calculate score for each measurement
      for (const [measurementType, range] of Object.entries(sizeSpec)) {
        if (measurements[measurementType]) {
          const userMeasurement = measurements[measurementType];
          
          // Check if measurement is within range
          if (userMeasurement >= range.min && userMeasurement <= range.max) {
            // Perfect match
            totalScore += 1;
          } else {
            // Calculate how far outside the range
            const distanceFromRange = userMeasurement < range.min
              ? (range.min - userMeasurement) / (range.max - range.min)
              : (userMeasurement - range.max) / (range.max - range.min);
            
            // Convert to score (closer to range = higher score)
            const score = Math.max(0, 1 - distanceFromRange * 0.5);
            totalScore += score;
          }
          
          measurementCount++;
        }
      }
      
      // Calculate average score if we have measurements
      scores[size] = measurementCount > 0
        ? totalScore / measurementCount
        : 0.5; // Default to medium confidence if no relevant measurements
    }
    
    // Find size with highest score
    let bestSize = availableSizes[0];
    let highestScore = scores[bestSize] || 0;
    
    for (const [size, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestSize = size;
      }
    }
    
    return {
      size: bestSize,
      confidence: highestScore
    };
  }

  /**
   * Calculate alternative sizes if primary recommendation is not available
   * @param {String} productType - Type of product
   * @param {Object} measurements - User's measurements
   * @param {Array} availableSizes - Available sizes
   * @param {String} primarySize - Primary recommended size
   * @returns {Array} Alternative sizes with confidence scores
   */
  calculateAlternativeSizes(productType, measurements, availableSizes, primarySize) {
    const sizeStandard = this.sizeStandards[productType];
    
    if (!sizeStandard) {
      return [];
    }
    
    const alternatives = [];
    
    // Filter out primary size
    const otherSizes = availableSizes.filter(size => size !== primarySize);
    
    // Calculate scores for alternatives
    for (const size of otherSizes) {
      if (!sizeStandard[size]) {
        alternatives.push({ size, confidence: 0.3 });
        continue;
      }
      
      const sizeSpec = sizeStandard[size];
      let totalScore = 0;
      let measurementCount = 0;
      
      // Calculate score for each measurement
      for (const [measurementType, range] of Object.entries(sizeSpec)) {
        if (measurements[measurementType]) {
          const userMeasurement = measurements[measurementType];
          
          // Check if measurement is within range
          if (userMeasurement >= range.min && userMeasurement <= range.max) {
            // Good match
            totalScore += 0.8; // Slightly lower than primary for consistency
          } else {
            // Calculate how far outside the range
            const distanceFromRange = userMeasurement < range.min
              ? (range.min - userMeasurement) / (range.max - range.min)
              : (userMeasurement - range.max) / (range.max - range.min);
            
            // Convert to score (closer to range = higher score)
            const score = Math.max(0, 0.8 - distanceFromRange * 0.5);
            totalScore += score;
          }
          
          measurementCount++;
        }
      }
      
      // Calculate average score if we have measurements
      const confidence = measurementCount > 0
        ? totalScore / measurementCount
        : 0.3; // Lower default confidence for alternatives
      
      alternatives.push({ size, confidence });
    }
    
    // Sort by confidence (highest first)
    alternatives.sort((a, b) => b.confidence - a.confidence);
    
    // Return top 2 alternatives
    return alternatives.slice(0, 2);
  }

  /**
   * Get size recommendation based on user's style profile
   * @param {Object} product - The product
   * @param {String} userId - User ID
   * @returns {Object} Size recommendation
   */
  async getRecommendationByUser(product, userId) {
    try {
      // Get user's measurements from database
      const userMeasurements = await this.userMeasurementService_.retrieveByUser(userId);
      
      if (!userMeasurements) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "User measurements not found. Please complete your profile."
        );
      }
      
      // Get recommendation based on measurements
      return this.getRecommendation(product, userMeasurements);
    } catch (error) {
      throw error;
    }
  }
}

export default SizeRecommendationService;
