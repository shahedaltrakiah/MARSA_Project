import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** Laravel `storage` URLs for project logos (`NEXT_PUBLIC_API_URL` defaults to localhost:8000 in dev). */
function logoRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: "http",
      hostname: "localhost",
      port: "8000",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "8000",
      pathname: "/**",
    },
  ]
  const raw = process.env.NEXT_PUBLIC_API_URL
  if (!raw) return patterns
  try {
    const originStr = raw.replace(/\/api\/?$/, "")
    const u = new URL(originStr.includes("://") ? originStr : `http://${originStr}`)
    patterns.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/**",
    })
  } catch {
    /* ignore invalid env */
  }
  return patterns
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...logoRemotePatterns(),
    ],
  },
};

export default withNextIntl(nextConfig);
