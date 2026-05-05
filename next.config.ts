import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sequelize", "mysql2", "exceljs"],
};

export default nextConfig;
