/** @type {import('next').NextConfig} */

/**
 * 增加开发用配置，当访问/api/xx时，映射到后端localhost:8080/xxx
 */
module.exports = {
  //代理重定向到后台服务
  async rewrites() {
    return {
      fallback: [{
        source: '/api/:path*',
        destination: `http://localhost:8080/:path*`,
      }, ],
    }
  },
}