// API route for creating a new event.
// app/api/events/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { EventCategory } from "@prisma/client";
import { z } from "zod";
import { dataCache } from "@/lib/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const createEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
      .max(200, "Tiêu đề không được quá 200 ký tự"),
    description: z
      .string()
      .min(10, "Mô tả phải có ít nhất 10 ký tự")
      .max(5000, "Mô tả không được quá 5000 ký tự"),
    location: z
      .string()
      .min(3, "Địa điểm phải có ít nhất 3 ký tự")
      .max(500, "Địa điểm không được quá 500 ký tự"),
    startDateTime: z.coerce.date(),
    endDateTime: z.coerce.date(),
    maxAttendees: z.coerce
      .number()
      .int("Số người tham gia phải là số nguyên")
      .positive("Số người tham gia phải là số dương")
      .min(1, "Số người tham gia tối thiểu là 1")
      .max(10000, "Số người tham gia không được quá 10,000"),
    category: z.enum(EventCategory),
  })
  .refine(
    (data) => {
      return new Date(data.startDateTime) > new Date();
    },
    {
      message: "Thời gian bắt đầu phải sau thời điểm hiện tại",
      path: ["startDateTime"],
    }
  )
  .refine(
    (data) => {
      return new Date(data.endDateTime) > new Date(data.startDateTime);
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["endDateTime"],
    }
  )
  .refine(
    (data) => {
      const duration =
        new Date(data.endDateTime).getTime() -
        new Date(data.startDateTime).getTime();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      return duration <= thirtyDaysInMs;
    },
    {
      message: "Sự kiện không được kéo dài quá 30 ngày",
      path: ["endDateTime"],
    }
  );

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.id ||
      (session.user.role !== "ADMIN" && session.user.role !== "EVENT_MANAGER")
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const startDateTime = formData.get("startDateTime") as string;
    const endDateTime = formData.get("endDateTime") as string;
    const maxAttendees = parseInt(formData.get("maxAttendees") as string);
    const category = formData.get("category") as EventCategory;
    const requirePostApproval = formData.get("requirePostApproval") === "true";
    const requiresRegistrationForm = formData.get("requiresRegistrationForm");
    const imageFile = formData.get("image") as File | null;
    const registrationQuestionsStr = formData.get(
      "registrationQuestions"
    ) as string;

    let registrationQuestions: { question: string; isRequired: boolean }[] = [];
    if (registrationQuestionsStr) {
      try {
        registrationQuestions = JSON.parse(registrationQuestionsStr);
      } catch (e) {
        console.error("Error parsing registration questions:", e);
      }
    }

    const validatedData = createEventSchema.parse({
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      maxAttendees,
      category,
    });

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(imageFile.name);
        const filename = `event-${uniqueSuffix}${ext}`;

        const uploadsDir = path.join(
          process.cwd(),
          "uploads",
          "events"
        );
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        imageUrl = `/api/uploads/events/${filename}`;
      } catch (error) {
        console.error("Error uploading image:", error);
        return new NextResponse("Không thể tải lên ảnh", { status: 500 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          ...validatedData,
          imageUrl,
          requirePostApproval,
          requiresRegistrationForm: requiresRegistrationForm === "true",
          creatorId: session.user.id,
          status:
            session.user.role === "ADMIN" ? "PUBLISHED" : "PENDING_APPROVAL",
        },
      });

      if (registrationQuestions.length > 0) {
        await tx.registrationQuestion.createMany({
          data: registrationQuestions.map((q, index) => ({
            eventId: newEvent.id,
            question: q.question,
            isRequired: q.isRequired,
            order: index,
          })),
        });
      }

      await tx.eventManager.create({
        data: {
          userId: session.user.id,
          eventId: newEvent.id,
          assignedBy: session.user.id,
        },
      });

      return newEvent;
    });

    dataCache.invalidatePattern("homepage:events");

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }
    console.error("LỖI KHI TẠO SỰ KIỆN:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
