/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    // Type checking is run separately with `npm run typecheck`.
    ignoreBuildErrors: true
  }
};

export default nextConfig;
