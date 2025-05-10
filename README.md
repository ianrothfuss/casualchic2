# Casual Chic Boutique 2.0

![Casual Chic Boutique 2.0](https://via.placeholder.com/1200x630/e4e7eb/4a90e2?text=Casual+Chic+Boutique+2.0)

Casual Chic Boutique 2.0 is a modern fashion e-commerce platform built on Medusa.js. It combines core e-commerce functionality with fashion-specific features like virtual try-on, outfit builder, style profiles, and size recommendations.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## Features

- **Virtual Try-On**: Try clothes virtually before purchasing
- **Outfit Builder**: Create and save complete outfit combinations
- **Size Recommendation**: Get personalized size recommendations based on your measurements
- **Style Profile**: Receive product recommendations tailored to your style preferences

## Tech Stack

### Backend
- **Medusa.js**: Headless e-commerce platform
- **Node.js**: JavaScript runtime
- **PostgreSQL**: Database
- **Redis**: Caching
- **TypeORM**: ORM for database management

### Frontend
- **Next.js**: React framework for frontend
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Prerequisites

- Node.js v16 or later
- npm v8 or later
- PostgreSQL v14 or later
- Redis v6 or later

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/casual-chic-boutique-2.0.git
cd casual-chic-boutique-2.0
```

### 2. Install dependencies

```bash
npm run setup
```

This will install all dependencies for both the backend and frontend projects.

### 3. Configure environment variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```
PORT=9000
DATABASE_URL=postgres://username:password@localhost:5432/casual_chic_boutique
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7000
```

#### Frontend (.env.local)

Create a `.env.local` file in the `storefront` directory:

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

### 4. Set up the database

```bash
# Create the database
createdb casual_chic_boutique

# Run migrations
npm run migrations

# Optional: Seed the database with test data
npm run seed
```

### 5. Start the development servers

```bash
npm start
```

This will start both the backend (port 9000) and frontend (port 3000) development servers.

The storefront will be available at: http://localhost:3000
The Medusa admin panel will be available at: http://localhost:7000

## Project Structure

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
└── package.json           # Root package.json for development commands
```

## Custom Services

### Outfit Service
Manages outfit collections and product combinations

### Size Recommendation Service
Calculates size recommendations based on user measurements

### Style Profile Service
Handles user style preferences and personalized recommendations

### Virtual Try-On Service
Manages image processing and virtual garment visualizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Medusa.js](https://medusajs.com/) for the e-commerce framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling