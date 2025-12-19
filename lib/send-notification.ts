// send push notifications in various scenarios (server send ~ backend)
// lib/send-notification.ts

import prisma from "@/lib/prisma";
import { sendPushNotificationToMany } from "@/lib/push-notifications";

/**
 * Send notification when registration is approved
 */
export async function notifyRegistrationApproved(
  userId: string,
  eventTitle: string,
  eventId: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Đăng ký được duyệt!",
      body: `Đăng ký tham gia "${eventTitle}" của bạn đã được duyệt.`,
      url: `/events/${eventId}`,
      tag: `registration-approved-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending registration approved:", error);
  }
}

/**
 * registration is rejected
 */
export async function notifyRegistrationRejected(
  userId: string,
  eventTitle: string,
  eventId: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Đăng ký bị từ chối",
      body: `Rất tiếc, đăng ký tham gia "${eventTitle}" của bạn đã bị từ chối.`,
      url: `/events/${eventId}`,
      tag: `registration-rejected-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending registration rejected:", error);
  }
}

/**
 * registration is completed
 */
export async function notifyRegistrationCompleted(
  userId: string,
  eventTitle: string,
  eventId: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Hoàn thành sự kiện!",
      body: `Bạn đã hoàn thành tham gia sự kiện "${eventTitle}". Cảm ơn sự đóng góp của bạn!`,
      url: `/events/${eventId}`,
      tag: `registration-completed-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending registration completed:", error);
  }
}

/**
 * event is published (for creator)
 */
export async function notifyEventPublished(
  creatorId: string,
  eventTitle: string,
  eventId: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: creatorId },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Sự kiện đã được duyệt!",
      body: `Sự kiện "${eventTitle}" của bạn đã được duyệt và công bố.`,
      url: `/events/${eventId}`,
      tag: `event-published-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending event published:", error);
  }
}

/**
 * event is rejected (for creator)
 */
export async function notifyEventRejected(
  creatorId: string,
  eventTitle: string,
  eventId: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: creatorId },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Sự kiện bị từ chối",
      body: `Rất tiếc, sự kiện "${eventTitle}" của bạn đã bị từ chối.`,
      url: `/events/${eventId}`,
      tag: `event-rejected-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending event rejected:", error);
  }
}

/**
 * send to all registered users when event is about to start
 * 1 day before
 */
export async function notifyEventStartingSoon(
  eventId: string,
  eventTitle: string,
  startDateTime: Date
) {
  try {
    // get all approved registrations for this event
    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: "APPROVED",
      },
      select: { userId: true },
    });

    if (registrations.length === 0) return;

    const userIds = registrations.map((reg) => reg.userId);

    // get all subscriptions for these users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const formattedDate = startDateTime.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Sự kiện sắp diễn ra!",
      body: `Sự kiện "${eventTitle}" sẽ bắt đầu vào ${formattedDate}.`,
      url: `/events/${eventId}`,
      tag: `event-reminder-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending event reminder notification:", error);
  }
}

/**
 * send when event is cancelled (all registered users)
 */
export async function notifyEventCancelled(
  eventId: string,
  eventTitle: string
) {
  try {
    // get all registrations for this event
    const registrations = await prisma.registration.findMany({
      where: { eventId },
      select: { userId: true },
    });

    if (registrations.length === 0) return;

    const userIds = registrations.map((reg) => reg.userId);

    // get all subscriptions for these users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const subscriptionsData = subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }));

    const result = await sendPushNotificationToMany(subscriptionsData, {
      title: "Sự kiện đã bị hủy",
      body: `Rất tiếc, sự kiện "${eventTitle}" đã bị xoá bởi người tổ chức.`,
      url: "/",
      tag: `event-cancelled-${eventId}`,
    });

    // Cleanup expired subscriptions
    if (result.expired.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: { in: result.expired } },
      });
    }
  } catch (error) {
    console.error("Error sending event cancelled notification:", error);
  }
}

/**
 *  new post in registered event
 */
// export async function notifyNewPost(
//     eventId: string,
//     eventTitle: string,
//     authorName: string,
//     excludeUserId?: string // Don't notify the post author
// ) {
//     try {
//         // Get all approved registrations except the author
//         const registrations = await prisma.registration.findMany({
//             where: {
//                 eventId,
//                 status: 'APPROVED',
//                 ...(excludeUserId && { userId: { not: excludeUserId } }),
//             },
//             select: { userId: true },
//         });

//         if (registrations.length === 0) return;

//         const userIds = registrations.map((reg) => reg.userId);

//         // Get all subscriptions for these users
//         const subscriptions = await prisma.pushSubscription.findMany({
//             where: { userId: { in: userIds } },
//             select: { endpoint: true, p256dh: true, auth: true },
//         });

//         if (subscriptions.length === 0) return;

//         const subscriptionsData = subscriptions.map((sub) => ({
//             endpoint: sub.endpoint,
//             keys: { p256dh: sub.p256dh, auth: sub.auth },
//         }));

//         await sendPushNotificationToMany(subscriptionsData, {
//             title: 'Bài viết mới',
//             body: `${authorName} đã đăng bài trong sự kiện "${eventTitle}"`,
//             url: `/events/${eventId}`,
//             tag: `new-post-${eventId}`,
//         });
//     } catch (error) {
//         console.error('Error sending new post notification:', error);
//     }
// }

/**
 * Generic function to send notification to a user
 */
export async function sendNotification({
  userId,
  message,
  href,
}: {
  userId: string;
  message: string;
  href?: string;
}) {
  try {
    // Create notification in database
    await prisma.notification.create({
      data: {
        userId,
        message,
        href: href || null,
      },
    });

    // Send push notification if user has subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length > 0) {
      const subscriptionsData = subscriptions.map((sub) => ({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }));

      const result = await sendPushNotificationToMany(subscriptionsData, {
        title: "Thông báo mới",
        body: message,
        url: href || "/",
        tag: `notification-${Date.now()}`,
      });

      // Cleanup expired subscriptions
      if (result.expired.length > 0) {
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: { in: result.expired } },
        });
      }
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
