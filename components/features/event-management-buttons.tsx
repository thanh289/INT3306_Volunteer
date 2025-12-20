// Client component for event management buttons (Edit, Delete, Cancel, Restore)
// components/features/event-management-buttons.tsx

"use client";

import { useSession } from "next-auth/react";
import { Event } from "@prisma/client";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";

type Props = {
  event: Event & {
    isCancelled?: boolean;
    cancelReason?: string | null;
  };
};

export const EventManagementButtons = ({ event }: Props) => {
  const { data: session } = useSession();
  const [isEventManager, setIsEventManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkManagerStatus = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/events/${event.id}/managers`);
        const managers = response.data;
        const isManager = managers.some(
          (m: any) => m.userId === session.user.id
        );
        setIsEventManager(isManager);
      } catch (error) {
        console.error("Failed to check manager status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkManagerStatus();
  }, [session?.user?.id, event.id]);

  // Check if user can manage: admin, creator, or assigned event manager
  const isAdmin = session?.user?.role === "ADMIN";
  const isCreator = session?.user && session.user.id === event.creatorId;
  const canManage = isAdmin || isCreator || isEventManager;

  if (isLoading || !canManage) {
    return null; // show nothing if have no permit or still loading
  }

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <Link
        href={`/events/${event.id}/manage`}
        className="btn btn-primary btn-md gap-2"
      >
        Quản lý
      </Link>
    </div>
  );
};
