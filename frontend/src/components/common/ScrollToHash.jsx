import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToHash Component
 * Automatically listens to URL hash changes and smoothly scrolls to the target anchor element.
 * Retries on asynchronous DOM rendering (e.g., initial catalog load).
 */
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      let attempts = 0;
      const maxAttempts = 10;

      const scrollToTarget = () => {
        const element = document.getElementById(id);
        if (element) {
          const navOffset = 80; // height of fixed/sticky navbar
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };

      // Try immediately
      if (!scrollToTarget()) {
        const interval = setInterval(() => {
          attempts += 1;
          if (scrollToTarget() || attempts >= maxAttempts) {
            clearInterval(interval);
          }
        }, 150);

        return () => clearInterval(interval);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
