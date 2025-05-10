// Casual Chic Boutique 2.0 - API Endpoints

// Backend: Outfit API Routes (src/api/routes/store/outfits/index.js)
import { Router } from "express";
import middlewares from "../../../middlewares";

const router = Router();

export default (app) => {
  app.use("/store/outfits", router);

  // Get all outfits
  router.get("/", middlewares.wrap(require("./list-outfits").default));

  // Get a single outfit
  router.get("/:id", middlewares.wrap(require("./get-outfit").default));

  // Create an outfit
  router.post(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./create-outfit").default)
  );

  // Delete an outfit
  router.delete(
    "/:id",
    middlewares.authenticate(),
    middlewares.wrap(require("./delete-outfit").default)
  );

  return router;
};

// Backend: List Outfits (src/api/routes/store/outfits/list-outfits.js)
export default async (req, res) => {
  const outfitService = req.scope.resolve("outfitService");
  
  const selector = {};
  const config = {
    relations: ["products"]
  };
  
  // Allow filtering by user
  if (req.query.created_by) {
    selector.created_by = req.query.created_by;
  }
  
  try {
    const outfits = await outfitService.list(selector, config);
    res.json({ outfits });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Get Outfit (src/api/routes/store/outfits/get-outfit.js)
export default async (req, res) => {
  const outfitService = req.scope.resolve("outfitService");
  
  const { id } = req.params;
  
  try {
    const outfit = await outfitService.retrieve(id, {
      relations: ["products"]
    });
    
    res.json({ outfit });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Backend: Create Outfit (src/api/routes/store/outfits/create-outfit.js)
export default async (req, res) => {
  const outfitService = req.scope.resolve("outfitService");
  
  const { name, description, products } = req.body;
  
  // Validate request
  if (!name || !products || !Array.isArray(products) || !products.length) {
    return res.status(400).json({
      message: "Name and at least one product are required"
    });
  }
  
  try {
    const outfitData = {
      name,
      description,
      products,
      created_by: req.user.customer_id // Associate with the logged-in customer
    };
    
    const outfit = await outfitService.create(outfitData);
    
    res.status(201).json({ outfit });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Delete Outfit (src/api/routes/store/outfits/delete-outfit.js)
export default async (req, res) => {
  const outfitService = req.scope.resolve("outfitService");
  
  const { id } = req.params;
  
  try {
    // First retrieve to check ownership
    const outfit = await outfitService.retrieve(id);
    
    // Check if the authenticated user is the creator
    if (outfit.created_by !== req.user.customer_id) {
      return res.status(403).json({
        message: "You do not have permission to delete this outfit"
      });
    }
    
    await outfitService.delete(id);
    
    res.status(200).json({ id, object: "outfit", deleted: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: User Measurements API Routes (src/api/routes/store/measurements/index.js)
import { Router } from "express";
import middlewares from "../../../middlewares";

const router = Router();

export default (app) => {
  app.use("/store/measurements", router);

  // Get user measurements
  router.get(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./get-measurements").default)
  );

  // Update user measurements
  router.post(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./update-measurements").default)
  );

  return router;
};

// Backend: Get User Measurements (src/api/routes/store/measurements/get-measurements.js)
export default async (req, res) => {
  const measurementService = req.scope.resolve("measurementService");
  
  try {
    const measurements = await measurementService.retrieveByUser(req.user.customer_id);
    res.json({ measurements });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Backend: Update User Measurements (src/api/routes/store/measurements/update-measurements.js)
export default async (req, res) => {
  const measurementService = req.scope.resolve("measurementService");
  
  const { height, weight, bust, waist, hips, shoulder_width, inseam } = req.body;
  
  try {
    const measurementsData = {
      user_id: req.user.customer_id,
      height,
      weight,
      bust,
      waist,
      hips,
      shoulder_width,
      inseam
    };
    
    const measurements = await measurementService.upsert(measurementsData);
    
    res.json({ measurements });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Virtual Try-On API Routes (src/api/routes/store/virtual-try-on/index.js)
import { Router } from "express";
import multer from "multer";
import middlewares from "../../../middlewares";

const upload = multer({ dest: "uploads/" });
const router = Router();

export default (app) => {
  app.use("/store/virtual-try-on", router);

  // Upload user image
  router.post(
    "/upload",
    middlewares.authenticate(),
    upload.single("image"),
    middlewares.wrap(require("./upload-image").default)
  );

  // Generate try-on
  router.post(
    "/generate",
    middlewares.authenticate(),
    middlewares.wrap(require("./generate-try-on").default)
  );

  // Get try-on result
  router.get(
    "/:id",
    middlewares.authenticate(),
    middlewares.wrap(require("./get-try-on").default)
  );

  return router;
};

// Backend: Upload Image for Virtual Try-On (src/api/routes/store/virtual-try-on/upload-image.js)
export default async (req, res) => {
  const fileService = req.scope.resolve("fileService");
  
  if (!req.file) {
    return res.status(400).json({ message: "No image provided" });
  }
  
  try {
    // Upload file to storage service (e.g., S3)
    const result = await fileService.upload({
      path: req.file.path,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    res.status(201).json({
      id: result.id,
      url: result.url
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Generate Virtual Try-On (src/api/routes/store/virtual-try-on/generate-try-on.js)
export default async (req, res) => {
  const virtualTryOnService = req.scope.resolve("virtualTryOnService");
  
  const { product_id, user_image_id } = req.body;
  
  // Validate request
  if (!product_id || !user_image_id) {
    return res.status(400).json({
      message: "Product ID and user image ID are required"
    });
  }
  
  try {
    // Create a record for the try-on request
    const tryOn = await virtualTryOnService.create({
      user_id: req.user.customer_id,
      product_id,
      user_image_id
    });
    
    // Start the generation process asynchronously
    virtualTryOnService.startGeneration(tryOn.id).catch((err) => {
      console.error(`Error generating try-on for ${tryOn.id}:`, err);
    });
    
    res.status(202).json({
      id: tryOn.id,
      status: tryOn.status
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Get Virtual Try-On Result (src/api/routes/store/virtual-try-on/get-try-on.js)
export default async (req, res) => {
  const virtualTryOnService = req.scope.resolve("virtualTryOnService");
  
  const { id } = req.params;
  
  try {
    const tryOn = await virtualTryOnService.retrieve(id);
    
    // Check if user has access to this try-on
    if (tryOn.user_id !== req.user.customer_id) {
      return res.status(403).json({
        message: "You do not have permission to view this try-on"
      });
    }
    
    res.json({ try_on: tryOn });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Backend: Size Recommendation API Routes (src/api/routes/store/size-recommendation/index.js)
import { Router } from "express";
import middlewares from "../../../middlewares";

const router = Router();

export default (app) => {
  app.use("/store/size-recommendation", router);

  // Get size recommendation
  router.post(
    "/",
    middlewares.wrap(require("./get-recommendation").default)
  );

  return router;
};

// Backend: Get Size Recommendation (src/api/routes/store/size-recommendation/get-recommendation.js)
export default async (req, res) => {
  const sizeRecommendationService = req.scope.resolve("sizeRecommendationService");
  const productService = req.scope.resolve("productService");
  
  const { product_id, measurements } = req.body;
  
  // Validate request
  if (!product_id || !measurements) {
    return res.status(400).json({
      message: "Product ID and measurements are required"
    });
  }
  
  try {
    // Get product details
    const product = await productService.retrieve(product_id, {
      relations: ["variants"]
    });
    
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    
    // Get size recommendation
    const recommendation = await sizeRecommendationService.getRecommendation(
      product,
      measurements
    );
    
    res.json({
      product_id,
      recommended_size: recommendation.size,
      confidence: recommendation.confidence,
      alternative_sizes: recommendation.alternatives
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Style Profile API Routes (src/api/routes/store/style-profile/index.js)
import { Router } from "express";
import middlewares from "../../../middlewares";

const router = Router();

export default (app) => {
  app.use("/store/style-profile", router);

  // Get user style profile
  router.get(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./get-profile").default)
  );

  // Update user style profile
  router.post(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./update-profile").default)
  );

  // Get personalized recommendations
  router.get(
    "/recommendations",
    middlewares.authenticate(),
    middlewares.wrap(require("./get-recommendations").default)
  );

  return router;
};

// Backend: Get User Style Profile (src/api/routes/store/style-profile/get-profile.js)
export default async (req, res) => {
  const styleProfileService = req.scope.resolve("styleProfileService");
  
  try {
    const profile = await styleProfileService.retrieveByUser(req.user.customer_id);
    res.json({ profile });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Backend: Update User Style Profile (src/api/routes/store/style-profile/update-profile.js)
export default async (req, res) => {
  const styleProfileService = req.scope.resolve("styleProfileService");
  
  const {
    preferred_styles,
    preferred_colors,
    preferred_occasions,
    disliked_styles,
    disliked_colors,
    size_preferences
  } = req.body;
  
  try {
    const profileData = {
      user_id: req.user.customer_id,
      preferred_styles,
      preferred_colors,
      preferred_occasions,
      disliked_styles,
      disliked_colors,
      size_preferences
    };
    
    const profile = await styleProfileService.upsert(profileData);
    
    res.json({ profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Backend: Get Personalized Recommendations (src/api/routes/store/style-profile/get-recommendations.js)
export default async (req, res) => {
  const styleProfileService = req.scope.resolve("styleProfileService");
  const productService = req.scope.resolve("productService");
  
  try {
    // Get user's style profile
    const profile = await styleProfileService.retrieveByUser(req.user.customer_id);
    
    if (!profile) {
      return res.status(404).json({
        message: "Style profile not found. Please create a style profile first."
      });
    }
    
    // Generate personalized product recommendations
    const recommendations = await styleProfileService.generateRecommendations(profile);
    
    // Get full product details for recommended products
    const products = await productService.list({
      id: recommendations.map(rec => rec.product_id)
    });
    
    // Add recommendation score to each product
    const productsWithScores = products.map(product => {
      const recommendation = recommendations.find(rec => rec.product_id === product.id);
      return {
        ...product,
        match_score: recommendation.score
      };
    });
    
    // Sort by match score
    productsWithScores.sort((a, b) => b.match_score - a.match_score);
    
    res.json({
      recommendations: productsWithScores
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
