/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required so Next transpiles our workspace package's raw TypeScript
  // (it lives in node_modules via the npm workspace symlink).
  transpilePackages: ["@ai-hiring/shared-types"],
};

export default nextConfig;