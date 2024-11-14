/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 启用静态导出
  images: {
    unoptimized: true,
  },
  basePath: '/matrix',  // 你的仓库名
}

module.exports = nextConfig
