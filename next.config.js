/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    /**
     * During development:
     *
     * Browser:
     *     http://localhost:3000/api/products/
     *
     * Next.js internally forwards it to:
     *     http://127.0.0.1:8000/api/products/
     *
     * The browser therefore never needs to know where
     * Django is running.
     */
    return [
      {
        source: "/api/:path*",

        destination:
          process.env.DJANGO_API_URL ||
          "http://127.0.0.1:8000/api/:path*",
      },

      /**
       * Product images uploaded to Django.
       *
       * Example:s
       *
       * /media/images/product.jpg
       *
       * will be forwarded to Django during development.
       */
      {
        source: "/media/:path*",

        destination:
          process.env.DJANGO_API_URL
            ? `${process.env.DJANGO_API_URL}/media/:path*`
            : "http://127.0.0.1:8000/media/:path*",
      },
    ];
  },
};

module.exports = nextConfig;