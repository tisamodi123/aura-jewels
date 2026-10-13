/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['localhost'],
  basePath: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
  assetPrefix: process.env.NEXT_PUBLIC_PREFIX || "",
  images: {
    // Admin renders pre-rendered CDN assets (product/collection images) that
    // don't need Next's on-the-fly optimizer — which was failing with
    // "access denied" when proxy-fetching the CloudFront originals. Serving
    // them un-optimized (plain <img>) is the reliable fix for an internal panel
    // and also sidesteps the remotePatterns host check.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d7fjtzyswo65g.cloudfront.net",
      },
      {
        protocol: 'https',
        hostname: 's3.ap-south-1.amazonaws.com',
      },
      {
        protocol: "https",
        hostname: "mediassests.s3.amazonaws.com",
        port: "",
        pathname: "/**", // allow all paths under this host and port
      },
      {
        protocol: "https",
        hostname: "scintilla-assets.s3.ap-southeast-2.amazonaws.com",
        port: "",
        pathname: "/**", // allow all paths under this host and port
      },
      {
        protocol: "https",
        hostname: "d2spbytg38ui5z.cloudfront.net",
        port: "",
        pathname: "/**", // allow all paths under this host and port
      },
      {
        protocol: "https",
        hostname: "webassests.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**", // allow all paths under this host and port
      },
    ],
  },
};

export default nextConfig;
