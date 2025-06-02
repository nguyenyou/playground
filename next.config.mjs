/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  trailingSlash: true,
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
