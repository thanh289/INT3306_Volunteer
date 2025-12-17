// Page for displaying interested events (favorites)
// app/(main)/interested-events/page.tsx

import { InterestedEventList } from "@/components/features/interested-event-list";

export default function InterestedEventsPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          Sự kiện quan tâm
        </h1>
        <p className="text-base-content/60 mt-2">
          Các sự kiện bạn đã đánh dấu yêu thích
        </p>
      </div>
      <InterestedEventList />
    </div>
  );
}
