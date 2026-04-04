import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcrypt", "pg", "@prisma/adapter-pg"],
};

export default nextConfig;
