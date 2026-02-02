/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Server-Pakete nicht mit Webpack bündeln (vermeidet Fehler mit pg/Prisma auf Render)
  serverExternalPackages: ['pg', '@prisma/adapter-pg', '@prisma/client', 'prisma'],
  // Umgehe Netzwerk-Interface-Problem
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Explizite Host-Konfiguration
  // hostname: 'localhost',
  // port: 3000,
  // CesiumJS Webpack-Konfiguration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    return config
  },
  // Behebt WebKit Error 300
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
