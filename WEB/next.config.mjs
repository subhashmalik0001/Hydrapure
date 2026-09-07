// Fix Node 25 experimental web storage SSR bug
// Use property descriptor check to avoid triggering the getter (which emits a warning)
const _lsDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
if (_lsDescriptor) {
  try {
    delete globalThis.localStorage;
  } catch (_) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}, key: () => null, length: 0 },
      configurable: true, writable: true,
    });
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
