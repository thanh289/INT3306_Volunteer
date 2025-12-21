// API route for admin to export events to CSV
// app/api/admin/events/export/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Prisma, EventStatus, EventCategory } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const display = searchParams.get("display") || "";

    // Build where clause
    const whereClause: Prisma.EventWhereInput = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      whereClause.status = status as EventStatus;
    }

    if (category && category !== "ALL") {
      whereClause.category = category as EventCategory;
    }

    if (display && display !== "ALL") {
      if (display === "ACTIVE") {
        // Đang hoạt động: không bị hủy và không bị xóa
        whereClause.isCancelled = false;
        whereClause.isDeleted = false;
      } else if (display === "CANCELLED") {
        // Đã hủy tạm thời: isCancelled = true, nhưng chưa xóa
        whereClause.isCancelled = true;
        whereClause.isDeleted = false;
      } else if (display === "DELETED") {
        // Đã xóa hẳn: isDeleted = true
        whereClause.isDeleted = true;
      }
    }

    // Get all events matching filters
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        creator: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create CSV content
    const headers = [
      "ID",
      "Tên sự kiện",
      "Mô tả",
      "Địa điểm",
      "Người tạo",
      "Email người tạo",
      "Thể loại",
      "Trạng thái",
      "Thời gian bắt đầu",
      "Thời gian kết thúc",
      "Số người tối đa",
      "Số người đăng ký",
      "Bị hủy",
      "Lý do hủy",
      "Bị xóa",
      "Ngày tạo",
    ];

    const csvRows = [
      headers.join(","),
      ...events.map((event) => {
        const categoryLabels: Record<string, string> = {
          ENVIRONMENT: "Môi trường",
          EDUCATION: "Giáo dục",
          HEALTHCARE: "Y tế",
          COMMUNITY: "Cộng đồng",
        };

        const statusLabels: Record<string, string> = {
          PUBLISHED: "Đã đăng",
          PENDING_APPROVAL: "Chờ duyệt",
          REJECTED: "Bị từ chối",
        };

        return [
          event.id,
          `"${event.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
          `"${event.description.replace(/"/g, '""')}"`,
          `"${event.location.replace(/"/g, '""')}"`,
          `"${event.creator.name || "N/A"}"`,
          event.creator.email,
          categoryLabels[event.category] || event.category,
          statusLabels[event.status] || event.status,
          new Date(event.startDateTime).toLocaleString("vi-VN"),
          new Date(event.endDateTime).toLocaleString("vi-VN"),
          event.maxAttendees,
          event._count?.registrations || 0,
          event.isCancelled ? "Có" : "Không",
          event.cancelReason
            ? `"${event.cancelReason.replace(/"/g, '""')}"`
            : "",
          event.isDeleted ? "Có" : "Không",
          new Date(event.createdAt).toLocaleString("vi-VN"),
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `events_export_${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("LỖI KHI XUẤT DỮ LIỆU:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
