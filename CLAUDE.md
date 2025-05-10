# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Known Issues and Fixes

When working with this codebase, be aware of these common issues:

1. **Missing React Imports**: Many components use hooks but don't import them. Always check that `useState`, `useEffect`, etc. are properly imported.

2. **Server-Side Rendering**: When accessing browser APIs like `localStorage` or `window`, always check that we're in the browser context first using:
   ```javascript
   if (typeof window !== 'undefined') {
     // Browser-only code
   }
   ```

3. **Missing Router**: Components that use navigation require the Next.js router. Ensure components that use navigation import and initialize the router:
   ```javascript
   import { useRouter } from 'next/router';
   const Component = () => {
     const router = useRouter();
     // Component code
   }
   ```

4. **API Error Handling**: When working with API client services, ensure proper error handling and consider implementing retries for network failures.

5. **Web Share API**: When using the Web Share API, add feature detection and fallbacks:
   ```javascript
   const handleShare = async () => {
     if (navigator.share) {
       try {
         await navigator.share({
           title: 'Product Name',
           text: 'Check out this product!',
           url: window.location.href
         });
       } catch (error) {
         console.error('Error sharing:', error);
       }
     } else {
       // Fallback for browsers that don't support Web Share API
     }
   };
   ```

6. **Missing buildQuery Function**: The `buildQuery` function is referenced in several services but not defined. When working with services that use this function, implement it as follows:
   ```javascript
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
   ```

7. **Null Checking**: Many components and services don't check for null/undefined values before accessing properties. Always add proper null checks:
   ```javascript
   // Instead of
   const name = object.property.name;

   // Do this
   const name = object?.property?.name || defaultValue;
   ```

## Project Overview

Casual Chic Boutique 2.0 is a fashion e-commerce platform built on the Medusa.js framework. The project combines core e-commerce functionality with specialized fashion features:

- Style Profile & Quiz for personalized recommendations
- Size Recommendation based on user measurements
- Virtual Try-On for clothes visualization
- Outfit Builder for creating and managing outfit collections

## Project Structure

The project is organized into two main directories:

```
casual-chic-boutique/
├── backend/               # Medusa backend
│   ├── src/
│   │   ├── api/           # Custom API endpoints
│   │   ├── services/      # Custom business logic
│   │   ├── models/        # Data models
│   │   ├── migrations/    # Database migrations
│   │   └── subscribers/   # Event handlers
│   └── medusa-config.js   # Medusa configuration
├── storefront/            # Frontend application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page templates
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client services
│   │   └── styles/        # Styling
│   └── next.config.js     # Next.js configuration
```

## Development Commands

### Backend Commands

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build the project
npm run build

# Run database migrations
medusa migrations run

# Start development server
npm run start

# Run tests
npm test
```

### Frontend Commands

```bash
# Navigate to storefront directory
cd storefront

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test
```

## Key Technologies

### Backend
- Medusa.js (Node.js e-commerce framework)
- PostgreSQL (database)
- Redis (caching)
- Express.js (API routing)

### Frontend
- Next.js (React framework)
- React Query (data fetching)
- React Hook Form (form handling)
- React DnD (drag-and-drop for outfit builder)
- Tailwind CSS (styling)

## Custom Services

The codebase includes several custom services extending Medusa.js core functionality:

1. **OutfitService** - Manages outfit collections, product combinations
2. **StyleProfileService** - Handles user style preferences and recommendations
3. **SizeRecommendationService** - Powers size calculation algorithm based on measurements
4. **VirtualTryOnService** - Manages image processing and virtual garment fitting

## API Structure

Custom API endpoints follow RESTful conventions:

- `GET /store/outfits` - List user's outfits
- `POST /store/outfits` - Create a new outfit
- `GET /store/style-profile` - Get user's style profile
- `POST /store/style-profile/quiz` - Submit style quiz answers
- `GET /store/size-recommendation/:productId` - Get size recommendation for product
- `POST /store/virtual-try-on` - Create virtual try-on image

## Working With This Codebase

When developing features:

1. Backend changes:
   - Implement services in `backend/src/services/`
   - Create API routes in `backend/src/api/routes/`
   - Add database migrations if needed

2. Frontend changes:
   - Create React components in `storefront/src/components/`
   - Set up pages in `storefront/src/pages/`
   - Add API client methods in `storefront/src/services/api.js`

## Database Migrations

When making changes to the database schema:

```bash
# Create a new migration file in backend/src/migrations/
cd backend
npm run build
medusa migrations run
```