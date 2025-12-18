// Global service worker registration provider
// providers/service-worker-provider.tsx

'use client';

import { useEffect } from 'react';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            // Register service worker when app loads
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration.scope);

                    // Check for updates periodically
                    registration.update();
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }, []);

    return <>{children}</>;
}
