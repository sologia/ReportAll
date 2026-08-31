/** @type {import('next').NextConfig} */
const nextConfig = {
  // during development proxy any request starting with /api/ to the backend server
  // this keeps frontend code unchanged (still uses `/api/...`) and avoids CORS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
