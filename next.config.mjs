/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:fs": "fs",
      "node:path": "path",
      "node:crypto": "crypto",
      "node:stream": "stream",
      "node:util": "util",
      "node:buffer": "buffer",
      "node:events": "events",
      "node:url": "url",
      "node:querystring": "querystring",
      "node:http": "http",
      "node:https": "https",
      "node:zlib": "zlib",
      "node:net": "net",
      "node:tls": "tls",
      "node:os": "os",
    };

    if (!isServer) {
      // Exclude MongoDB and server-only modules from client-side bundle
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
        buffer: false,
        util: false,
        events: false,
        querystring: false,
        aws4: false,
        "gcp-metadata": false,
        gaxios: false,
        "node-fetch": false,
        "fetch-blob": false,
      };
    }

    // Externalize MongoDB and AWS dependencies
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        snappy: "commonjs snappy",
        kerberos: "commonjs kerberos",
        "@mongodb-js/zstd": "commonjs @mongodb-js/zstd",
        "mongodb-client-encryption": "commonjs mongodb-client-encryption",
        "utf-8-validate": "commonjs utf-8-validate",
        bufferutil: "commonjs bufferutil",
        socks: "commonjs socks",
        aws4: "commonjs aws4",
        "gcp-metadata": "commonjs gcp-metadata",
        gaxios: "commonjs gaxios",
      });
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "mongodb",
      "better-auth",
      "@mongodb-js/zstd",
      "snappy",
      "kerberos",
      "mongodb-client-encryption",
      "utf-8-validate",
      "bufferutil",
      "socks",
      "aws4",
      "gcp-metadata",
      "gaxios",
    ],
  },
};

export default nextConfig;
