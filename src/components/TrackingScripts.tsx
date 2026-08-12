'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface TrackingScriptsProps {
  headerScripts?: string;
  bodyScripts?: string;
  footerScripts?: string;
}

export default function TrackingScripts({
  headerScripts: initialHeader = '',
  bodyScripts: initialBody = '',
  footerScripts: initialFooter = '',
}: TrackingScriptsProps) {
  const pathname = usePathname();
  const [scripts, setScripts] = useState({
    headerScripts: initialHeader,
    bodyScripts: initialBody,
    footerScripts: initialFooter,
  });

  // Strict Admin Isolation: Never run tracking scripts inside admin routes
  const isAdmin = Boolean(pathname && pathname.startsWith('/admin'));

  useEffect(() => {
    let isMounted = true;
    async function loadLatestScripts() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings && isMounted) {
          setScripts({
            headerScripts: data.settings.headerScripts || '',
            bodyScripts: data.settings.bodyScripts || '',
            footerScripts: data.settings.footerScripts || '',
          });
        }
      } catch (err) {
        console.error('Failed to load tracking codes:', err);
      }
    }

    loadLatestScripts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // 1. If currently inside admin dashboard, remove any previous tracking scripts and abort immediately
    if (isAdmin) {
      document.querySelectorAll('[data-lumiflick-tracker]').forEach((el) => el.remove());
      return;
    }

    if (typeof document === 'undefined') return;

    // 2. Helper to safely inject and execute HTML/scripts in a target container
    function injectSnippet(rawSnippet: string, targetContainer: HTMLElement, sectionId: string) {
      if (!rawSnippet || !rawSnippet.trim()) return;

      // Clean up previous elements for this specific section to prevent duplicate injections
      document.querySelectorAll(`[data-lumiflick-tracker="${sectionId}"]`).forEach((el) => el.remove());

      const parser = document.createElement('div');
      parser.innerHTML = rawSnippet;

      Array.from(parser.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const originalEl = node as HTMLElement;
          const tagName = originalEl.tagName.toLowerCase();

          if (tagName === 'script') {
            // Re-create script element so browser JavaScript engine executes it
            const newScript = document.createElement('script');
            newScript.setAttribute('data-lumiflick-tracker', sectionId);

            // Copy all attributes (e.g. async, defer, src, id, type)
            Array.from(originalEl.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });

            if (originalEl.textContent) {
              newScript.textContent = originalEl.textContent;
            }

            targetContainer.appendChild(newScript);
          } else {
            // For noscript, meta, style, img, iframe, or div tags
            const clone = originalEl.cloneNode(true) as HTMLElement;
            clone.setAttribute('data-lumiflick-tracker', sectionId);
            targetContainer.appendChild(clone);
          }
        }
      });
    }

    // Inject Head Scripts (GTM, Meta Pixel Base, Google Analytics gtag, verification tags)
    if (scripts.headerScripts) {
      injectSnippet(scripts.headerScripts, document.head, 'head');
    }

    // Inject Body Top Scripts (GTM noscript fallback iframe)
    if (scripts.bodyScripts) {
      injectSnippet(scripts.bodyScripts, document.body, 'body-top');
    }

    // Inject Footer / Body Bottom Scripts (Chat widgets, remarketing tags)
    if (scripts.footerScripts) {
      injectSnippet(scripts.footerScripts, document.body, 'footer');
    }

    return () => {
      // Cleanup on unmount or route change if navigating into admin
    };
  }, [isAdmin, scripts, pathname]);

  return null;
}
