'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchStoreSettings, getCachedStoreSettings } from '@/utils/storeSettings';

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
  const [scripts, setScripts] = useState(() => {
    const cached = getCachedStoreSettings();
    return {
      headerScripts: cached?.headerScripts || initialHeader,
      bodyScripts: cached?.bodyScripts || initialBody,
      footerScripts: cached?.footerScripts || initialFooter,
    };
  });

  // Strict Admin Isolation: Never run tracking scripts inside admin routes
  const isAdmin = Boolean(pathname && pathname.startsWith('/jw8yenjnkanhr823'));

  useEffect(() => {
    let isMounted = true;
    async function loadLatestScripts() {
      const settings = await fetchStoreSettings();
      if (settings && isMounted) {
        setScripts({
          headerScripts: settings.headerScripts || '',
          bodyScripts: settings.bodyScripts || '',
          footerScripts: settings.footerScripts || '',
        });
      }
    }

    const handleSettingsUpdate = () => {
      const cached = getCachedStoreSettings();
      if (cached) {
        setScripts({
          headerScripts: cached.headerScripts || '',
          bodyScripts: cached.bodyScripts || '',
          footerScripts: cached.footerScripts || '',
        });
      }
      loadLatestScripts();
    };

    window.addEventListener('lumiflick_settings_updated', handleSettingsUpdate);
    loadLatestScripts();

    return () => {
      isMounted = false;
      window.removeEventListener('lumiflick_settings_updated', handleSettingsUpdate);
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
            // For noscript, meta, style, img, iframe, or div tags.
            // Strip inline event-handler attributes (onerror, onload, ...) —
            // this snippet now requires an authenticated admin session to
            // set (see /api/admin/settings), but stripping them is cheap
            // defense-in-depth against a compromised session or stale data.
            const clone = originalEl.cloneNode(true) as HTMLElement;
            clone.setAttribute('data-lumiflick-tracker', sectionId);
            const stripHandlers = (el: Element) => {
              Array.from(el.attributes).forEach((attr) => {
                if (attr.name.toLowerCase().startsWith('on')) {
                  el.removeAttribute(attr.name);
                }
              });
              Array.from(el.children).forEach(stripHandlers);
            };
            stripHandlers(clone);
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
      // Cleanup
    };
  }, [isAdmin, scripts, pathname]);

  return null;
}
