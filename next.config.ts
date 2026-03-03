import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase Storage – public bucket uploads
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
