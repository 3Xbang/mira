// next-intl middleware 在 output: 'export' 静态导出模式下不支持
// 语言跳转由 LanguageSwitcher 组件在客户端处理
// 如果后期切换到服务端渲染模式，取消下面注释即可

// import createMiddleware from "next-intl/middleware";
// import { locales, defaultLocale } from "./i18n";
// export default createMiddleware({ locales, defaultLocale });
// export const config = {
//   matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
// };

export function middleware() {}
export const config = { matcher: [] };
