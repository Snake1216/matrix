/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/matrix',
  assetPrefix: '/matrix',  // 移除末尾的斜杠
  trailingSlash: true,     // 添加这行
}

module.exports = nextConfig
