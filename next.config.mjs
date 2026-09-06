// Fix Node 25 experimental web storage SSR bug
if (typeof globalThis.localStorage !== 'undefined' && typeof globalThis.localStorage.getItem !== 'function') {
  try {
    delete globalThis.localStorage;
  } catch (e) {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory cache to prevent Node 25 V8 crash during PackFileCacheStrategy serialization
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;
