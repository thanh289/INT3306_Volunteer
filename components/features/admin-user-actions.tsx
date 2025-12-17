// Client component with actions for an admin to manage a user
// components/features/admin-user-actions.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { User, UserStatus, Role } from "@prisma/client";

type Props = {
  user: User;
  showRoleOnly?: boolean;
  showActionsOnly?: boolean;
  onUpdate?: () => void;
};

export const AdminUserActions = ({
  user,
  showRoleOnly,
  showActionsOnly,
  onUpdate,
}: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);

  const isCurrentUser = session?.user?.id === user.id;

  // Helper functions defined first
  const getRoleLabel = (role: Role): string => {
    const labels = {
      VOLUNTEER: "Tình nguyện viên",
      EVENT_MANAGER: "Quản lý sự kiện",
      ADMIN: "Quản trị viên",
    };
    return labels[role] || role;
  };

  const handleRoleChange = (newRole: Role) => {
    if (newRole === user.role) {
      return;
    }

    startTransition(async () => {
      try {
        await axios.patch(`/api/admin/users/${user.id}`, {
          role: newRole,
        });
        toast.success(`Đã đổi vai trò thành ${getRoleLabel(newRole)}.`);
        if (onUpdate) {
          onUpdate(); // Revalidate SWR cache
        }
        router.refresh();
      } catch (error) {
        toast.error(`Thao tác thất bại: ${error}`);
        setSelectedRole(user.role); // Reset on error
      }
    });
  };

  const handleToggleLock = () => {
    const newStatus =
      user.status === "ACTIVE" ? UserStatus.LOCKED : UserStatus.ACTIVE;
    const actionText = newStatus === "LOCKED" ? "khóa" : "mở khóa";

    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${actionText} tài khoản ${user.name}?`
      )
    ) {
      startTransition(async () => {
        try {
          await axios.patch(`/api/admin/users/${user.id}`, {
            status: newStatus,
          });
          toast.success(`Đã ${actionText} tài khoản.`);
          if (onUpdate) {
            onUpdate(); // Revalidate SWR cache
          }
          router.refresh();
        } catch (error) {
          toast.error(`Thao tác thất bại: ${error}`);
        }
      });
    }
  };

  // For role dropdown column
  if (showRoleOnly) {
    if (isCurrentUser) {
      return (
        <span className="badge badge-ghost">{getRoleLabel(user.role)}</span>
      );
    }

    return (
      <select
        className="select select-bordered select-sm"
        value={selectedRole}
        onChange={(e) => {
          const newRole = e.target.value as Role;
          setSelectedRole(newRole);
          handleRoleChange(newRole);
        }}
        disabled={isPending}
      >
        <option value="VOLUNTEER">Tình nguyện viên</option>
        <option value="EVENT_MANAGER">Quản lý sự kiện</option>
        <option value="ADMIN">Quản trị viên</option>
      </select>
    );
  }

  // For action buttons column
  if (showActionsOnly) {
    if (isCurrentUser) {
      return;
    }

    return (
      <button
        onClick={handleToggleLock}
        disabled={isPending}
        className={`btn btn-xs disabled:opacity-50 ${
          user.status === "ACTIVE" ? "btn-error" : "btn-success"
        }`}
      >
        {isPending
          ? "Đang xử lý..."
          : user.status === "ACTIVE"
          ? "Khóa"
          : "Mở khóa"}
      </button>
    );
  }
};
