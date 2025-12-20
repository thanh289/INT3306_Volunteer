// Client component for managing push notification in settings
// components/features/push-notification-setting.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

export const PushNotificationSetting = () => {
  const { status } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [currentSubscription, setCurrentSubscription] =
    useState<PushSubscription | null>(null);

  useEffect(() => {
    const checkPushSupport = async () => {
      // check browser support condition
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        await checkCurrentSubscription();
      }
    };

    checkPushSupport();
  }, []);

  const checkCurrentSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      console.log("Current subscription:", subscription);
      setCurrentSubscription(subscription);
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsSubscribed(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (status !== "authenticated") {
      toast.error("Vui lòng đăng nhập để bật thông báo");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        toast.error("Bạn đã từ chối quyền thông báo");
        setIsLoading(false);
        return;
      }

      // 2. Get service worker registration (already registered globally)
      const registration = await navigator.serviceWorker.ready;

      // 3. Subscribe to push
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.error("VAPID public key not configured");
        toast.error(
          "Cấu hình thông báo không hợp lệ. Vui lòng liên hệ quản trị viên."
        );
        setIsLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("New subscription:", subscription); // Debug

      // 4. Send subscription to server
      await axios.post("/api/push/subscribe", subscription.toJSON());

      setCurrentSubscription(subscription);
      setIsSubscribed(true);
      toast.success("Đã bật thông báo thành công!");
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast.error("Không thể bật thông báo. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);

    try {
      if (!currentSubscription) {
        toast.error("Không tìm thấy subscription");
        setIsLoading(false);
        return;
      }

      // 1. Unsubscribe from browser
      const success = await currentSubscription.unsubscribe();
      console.log("Unsubscribe success:", success); // Debug

      if (!success) {
        throw new Error("Failed to unsubscribe");
      }

      // 2. Remove from server
      await axios.delete("/api/push/subscribe", {
        data: { endpoint: currentSubscription.endpoint },
      });

      // 3. Update state
      setCurrentSubscription(null);
      setIsSubscribed(false);
      toast.success("Đã tắt thông báo");
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast.error("Không thể tắt thông báo. Vui lòng thử lại.");

      // Recheck subscription status
      await checkCurrentSubscription();
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  // Don't show if not supported
  if (!isSupported) {
    return (
      <div className="alert alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Trình duyệt của bạn không hỗ trợ thông báo đẩy.</span>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <span className="loading loading-spinner loading-sm"></span>
        <span>Đang tải...</span>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Vui lòng đăng nhập để bật thông báo.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isSubscribed
              ? "bg-success/10 text-success"
              : "bg-base-200 text-base-content/60"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Thông báo</h3>
            <p className="text-sm text-base-content/60">
              {isSubscribed
                ? "Đang bật - Bạn sẽ nhận thông báo ngay trên màn hình"
                : "Nhận thông báo quan trọng ngay trên màn hình"}
            </p>
          </div>
        </div>

        {/* Toggle button for better visibility */}
        <button
          onClick={handleToggle}
          disabled={isLoading || permission === "denied"}
          className={`btn btn-sm font-semibold ${isSubscribed ? "btn-success text-cyan-500" : "btn-outline btn-primary"
            }`}
          aria-pressed={isSubscribed}
        >
          {isSubscribed ? "Đang bật" : "Bật thông báo"}
        </button>
      </div>

      {/* Permission denied warning */}
      {permission === "denied" && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Bạn đã chặn thông báo</p>
            <p className="text-xs mt-1">
              Vui lòng vào cài đặt trình duyệt để bật lại quyền thông báo cho
              trang này.
            </p>
          </div>
        </div>
      )}

      {/* Status info */}
      {isSubscribed && permission === "granted" && (
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm">
              Thông báo sẽ xuất hiện trên màn hình khi có:
            </p>
            <ul className="text-xs mt-1 ml-4 list-disc">
              <li>Đăng ký được duyệt/từ chối</li>
              <li>Sự kiện được công bố</li>
              <li>Bài viết mới trong sự kiện</li>
              <li>Và nhiều thông báo khác...</li>
            </ul>
          </div>
        </div>
      )}

      {/* Debug info (only in development) */}
      {/* {process.env.NODE_ENV === 'development' && (
                <details className="collapse collapse-arrow bg-base-200">
                    <summary className="collapse-title text-sm font-medium">
                        Debug Info
                    </summary>
                    <div className="collapse-content text-xs space-y-1">
                        <p>Permission: {permission}</p>
                        <p>Is Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
                        <p>Has Subscription: {currentSubscription ? 'Yes' : 'No'}</p>
                        {currentSubscription && (
                            <p className="break-all">Endpoint: {currentSubscription.endpoint.substring(0, 50)}...</p>
                        )}
                    </div>
                </details>
            )} */}
    </div>
  );
};
