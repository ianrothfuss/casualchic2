const dotenv = require('dotenv')

let ENV_FILE_NAME = '';
if (process.env.NODE_ENV === 'production') {
  ENV_FILE_NAME = '.env.production';
} else if (process.env.NODE_ENV === 'staging') {
  ENV_FILE_NAME = '.env.staging';
} else {
  ENV_FILE_NAME = '.env';
}

dotenv.config({ path: process.cwd() + '/' + ENV_FILE_NAME });

// CORS configurations
const STORE_CORS = process.env.STORE_CORS || "http://localhost:3000";
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7000";

// Database URL (PostgreSQL)
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/casual_chic_boutique";

// Redis URL
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Default module configurations
const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `medusa-file-s3`,
    options: {
      s3_url: process.env.S3_URL,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      access_key_id: process.env.S3_ACCESS_KEY_ID,
      secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    },
  },
  {
    resolve: `medusa-plugin-sendgrid`,
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      order_placed_template: process.env.SENDGRID_ORDER_PLACED_ID,
    },
  },
];

// Custom project configurations
module.exports = {
  projectConfig: {
    redis_url: REDIS_URL,
    database_url: DATABASE_URL,
    database_type: "postgres",
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    jwt_secret: process.env.JWT_SECRET,
    cookie_secret: process.env.COOKIE_SECRET,
  },
  plugins,
};