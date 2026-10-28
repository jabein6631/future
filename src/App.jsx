import React, { useEffect, useState, useRef } from 'react';
import rawTemplate from './template.html?raw';

/**
 * SkillSwap - React 18 Application Root
 * Mounts the exact, full-fidelity Vignan University Merit Platform
 * with reactive lifecycle management, script chaining, and state synchronization.
 */
export default function App() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const scriptUrls = [
      '/js/data.js?v=3.5',
      '/js/wallet.js?v=3.5',
      '/js/conference.js?v=3.5',
      '/js/codelab.js?v=3.5',
      '/js/app.js?v=3.5'
    ];

    // Sequential script loader to guarantee dependency resolution order
    const loadScript = (index) => {
      if (index >= scriptUrls.length) {
        // All scripts loaded, trigger app initialization if not already done
        if (window.app && typeof window.app.init === 'function' && !window.app._initialized) {
          try {
            window.app.init();
          } catch (err) {
            console.warn('SkillSwap App initialized:', err);
          }
        }
        return;
      }

      const src = scriptUrls[index];
      // Check if already injected
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => loadScript(index + 1);
      script.onerror = () => loadScript(index + 1);
      document.body.appendChild(script);
    };

    // Give DOM a microtask tick to settle
    const timeout = setTimeout(() => {
      loadScript(0);
    }, 50);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="skillswap-react-root-container"
      style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: rawTemplate }}
    />
  );
}
