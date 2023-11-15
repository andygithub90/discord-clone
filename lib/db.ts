// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
import { PrismaClient } from "@prisma/client";

declare module globalThis {
  var prisma: PrismaClient | undefined;
}

// next dev會在運行時清除 Node.js 緩存。 PrismaClient 由於熱重載會創建與數據庫的連接，因此每次都會初始化一個新實例。 PrismaClient 由於每個實例都有自己的連接池，因此這會很快耗盡數據庫連接。
// 解決方案是實例化單個實例 PrismaClient 並將其保存在 globalThis 。然後，我們進行檢查，僅在對象 PrismaClient 不在 globalThis 才進行實例化，如果已經存在，則再次使用相同的實例，以防止實例化額外的 PrismaClient 實例。
// global 是 Node.js 环境下的全局对象引用，window 是浏览器环境下的全局对象引用；而 globalThis 则是一个跨平台的通用全局对象引用，可以在不同环境中使用。
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
