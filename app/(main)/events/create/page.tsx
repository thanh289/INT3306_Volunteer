// English: A protected page for creating a new event.
// src/app/(main)/events/create/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/features/create-event-form";

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "EVENT_MANAGER")
  ) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-primary-content"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tạo sự kiện mới
          </span>
        </h1>
        <p className="text-base-content/70">
          Điền thông tin chi tiết để tạo sự kiện tình nguyện
        </p>
      </div>

      {/* Form Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}
