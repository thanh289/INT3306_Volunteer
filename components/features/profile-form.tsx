// A client component form for editing user profile information.
// components/features/profile-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { User, Gender } from "@prisma/client";

const formatDateForInput = (date: Date | null | undefined) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export const ProfileForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    dateOfBirth: formatDateForInput(user.dateOfBirth),
    gender: user.gender || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasChanges =
      formData.name !== (user.name || "") ||
      formData.phone !== (user.phone || "") ||
      formData.address !== (user.address || "") ||
      formData.dateOfBirth !== formatDateForInput(user.dateOfBirth) ||
      formData.gender !== (user.gender || "");

    if (!hasChanges) {
      toast.error("Bạn chưa thay đổi gì cả!");
      return;
    }

    setIsLoading(true);

    try {
      await axios.put("/api/profile", formData);
      await update();
      toast.success("Cập nhật hồ sơ thành công!");
      router.refresh();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        toast.error("Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.");
      } else {
        toast.error("Đã có lỗi không mong muốn xảy ra.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email không cho sửa */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-base-content"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          disabled
          value={user.email}
          className="mt-1 block w-full rounded-md border border-base-300 shadow-sm bg-base-200 text-base-content"
        />
      </div>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-base-content"
        >
          Họ và tên
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-base-300 shadow-sm bg-base-100 text-base-content"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-base-content"
          >
            Ngày sinh
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-base-300 shadow-sm bg-base-100 text-base-content"
          />
        </div>
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-base-content"
          >
            Giới tính
          </label>
          <select
            name="gender"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-base-300 shadow-sm bg-base-100 text-base-content"
          >
            <option value="">-- Chọn giới tính --</option>
            <option value={Gender.MALE}>Nam</option>
            <option value={Gender.FEMALE}>Nữ</option>
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-base-content"
        >
          Số điện thoại
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-base-300 shadow-sm bg-base-100 text-base-content"
        />
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-base-content"
        >
          Địa chỉ
        </label>
        <input
          type="text"
          name="address"
          id="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-base-300 shadow-sm bg-base-100 text-base-content"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
};
