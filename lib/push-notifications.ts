// push notifications: run on service worker (client receive, but ye on back ground, 
// so if you close the web, you can still get the notification)
// lib/push-notifications.ts

import webpush from 'web-push';

// VAPID keys configuration
// Generate keys with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
// cái này không bắt buộc nhưng nên có (theo chuẩn VAPID ~~)
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@volunteerhub.com';

// Initialize web-push with VAPID details
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
    actions?: Array<{
        action: string;
        title: string;
    }>;
}

/**
 * send push notification to just one subscription
 */
export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.error('VAPID keys not configured');
            return { success: false, error: 'Push notifications not configured' };
        }

        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            },
            JSON.stringify(payload)
        );

        return { success: true };
    } catch (error) {
        console.error('Error sending push notification:', error);

        // Handle expired subscriptions
        if (error && typeof error === 'object' && 'statusCode' in error) {
            const statusCode = (error as { statusCode: number }).statusCode;
            if (statusCode === 410 || statusCode === 404) {
                return {
                    success: false,
                    error: 'subscription_expired'
                };
            }
        }

        return {
            success: false,
            error: 'Failed to send notification'
        };
    }
}

/**
 * send push notification to multiple subscriptions
 */
export async function sendPushNotificationToMany(
    subscriptions: PushSubscriptionData[],
    payload: PushNotificationPayload
): Promise<{
    sent: number;
    failed: number;
    expired: string[]; // endpoints of expired subscriptions
}> {
    const results = await Promise.allSettled(
        subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    let sent = 0;
    let failed = 0;
    const expired: string[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            if (result.value.success) {
                sent++;
            } else {
                failed++;
                if (result.value.error === 'subscription_expired') {
                    expired.push(subscriptions[index].endpoint);
                }
            }
        } else {
            failed++;
        }
    });

    return { sent, failed, expired };
}

/**
 * check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * get notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}

/**
 * request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        return 'denied';
    }

    return await Notification.requestPermission();
}

/**
 * Get VAPID public key for client
 */
export function getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
}