import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        domains: ["erpjbntwpceijmuiwnjd.supabase.co"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "erpjbntwpceijmuiwnjd.supabase.co",
                port: "",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

export default nextConfig;
