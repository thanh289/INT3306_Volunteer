// Service Worker for handling push notifications
// public/sw.js

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(clients.claim());
});

// Handle push notification
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    let data = {
        title: 'VolunteerHub',
        body: 'Bạn có thông báo mới',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        url: '/',
    };

    if (event.data) {
        try {
            const text = event.data.text();
            console.log('Raw push data:', text);
            data = JSON.parse(text);
            console.log('Parsed push data:', data);
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    } else {
        console.warn('No data in push event');
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-72x72.png',
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
        },
        vibrate: [200, 100, 200],
        tag: data.tag || 'default',
        requireInteraction: false,
        actions: data.actions || [],
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event);
});