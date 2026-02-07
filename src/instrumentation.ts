/**
 * Next.js instrumentation. Runs once when the Node.js runtime loads.
 * Polyfills global Image in Node so code (e.g. image libs) that uses `new Image()` does not throw.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && typeof (globalThis as unknown as { Image?: unknown }).Image === 'undefined') {
    const StubImage = class {
      src = '';
      alt = '';
      crossOrigin = '';
      decoding: 'sync' | 'async' | 'auto' = 'auto';
      loading: 'eager' | 'lazy' = 'eager';
      width = 0;
      height = 0;
      naturalWidth = 0;
      naturalHeight = 0;
      complete = false;
      currentSrc = '';
      referrerPolicy = '';
      onload: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      decode() {
        return Promise.resolve();
      }
    };
    (globalThis as unknown as { Image: typeof StubImage }).Image = StubImage;
  }
}
