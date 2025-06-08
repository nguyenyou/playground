import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  experimental: {
    reactCompiler: true,
  },
};

export default withContentCollections(nextConfig);
