import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 仅在生产构建时启用静态导出，开发模式下禁用（与 middleware 不兼容）
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  images: {
    // 静态导出模式下不支持服务端图片优化，必须设为 unoptimized
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.mira-samui.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
