module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'medusa-public-images.s3.amazonaws.com',
      'your-bucket-name.s3.amazonaws.com' // Replace with your actual S3 bucket domain
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/:path*`
      }
    ]
  },
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  }
};