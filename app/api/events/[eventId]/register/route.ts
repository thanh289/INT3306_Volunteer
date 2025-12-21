// API route to handle a user's registration for a specific event.
// app/api/events/[eventId]/register/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

type PostParams = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function POST(request: Request, { params }: PostParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;
    const { eventId } = await params;

    // Parse request body for answers
    const body = await request.json();
    const answers = body.answers || [];

    // use transaction to prevent race condition
    // since 2 people may regist at the same time
    const newRegistration = await prisma.$transaction(async (tx) => {
      const [eventDetails, registrationCount, existingRegistration] =
        await Promise.all([
          tx.event.findUnique({ where: { id: eventId } }),
          tx.registration.count({ where: { eventId: eventId } }),
          tx.registration.findUnique({
            where: { userId_eventId: { userId, eventId } },
          }),
        ]);

      if (!eventDetails) {
        throw new Error("EVENT_NOT_FOUND");
      }

      if (new Date(eventDetails.endDateTime) < new Date()) {
        throw new Error("EVENT_ENDED");
      }

      // Check existing registration - allow re-registration if rejected
      if (existingRegistration) {
        if (existingRegistration.status === "REJECTED") {
          // Delete old rejected registration and its answers to allow re-registration
          await tx.registrationAnswer.deleteMany({
            where: { registrationId: existingRegistration.id },
          });
          await tx.registration.delete({
            where: { id: existingRegistration.id },
          });
        } else {
          throw new Error("ALREADY_REGISTERED");
        }
      }

      if (registrationCount >= eventDetails.maxAttendees) {
        throw new Error("EVENT_FULL");
      }

      // Create registration inside transaction
      const registration = await tx.registration.create({
        data: {
          userId: userId,
          eventId: eventId,
        },
      });

      // Save registration answers if any
      if (answers.length > 0) {
        await tx.registrationAnswer.createMany({
          data: answers.map(
            (answer: { questionId: string; answer: string }) => ({
              questionId: answer.questionId,
              registrationId: registration.id,
              answer: answer.answer,
            })
          ),
        });
      }

      return registration;
    });

    return NextResponse.json(newRegistration, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "EVENT_NOT_FOUND":
          return new NextResponse("Sự kiện không tồn tại", { status: 404 });
        case "EVENT_ENDED":
          return new NextResponse("Sự kiện đã kết thúc, không thể đăng ký.", {
            status: 400,
          });
        case "ALREADY_REGISTERED":
          return new NextResponse("Bạn đã đăng ký sự kiện này rồi", {
            status: 409,
          });
        case "EVENT_FULL":
          return new NextResponse("Sự kiện đã đủ số lượng người tham gia", {
            status: 409,
          });
      }
    }
    console.error("LỖI KHI ĐĂNG KÝ SỰ KIỆN:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: PostParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;
    const { eventId } = await params;

    const eventDetails = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (eventDetails && new Date(eventDetails.endDateTime) < new Date()) {
      return new NextResponse("Sự kiện đã kết thúc, không thể hủy đăng ký.", {
        status: 400,
      });
    }

    // delete from db
    await prisma.registration.delete({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId,
        },
      },
    });

    return NextResponse.json(
      { message: "Hủy đăng ký thành công" },
      { status: 200 }
    );
  } catch (error) {
    // catch error if user try to delete when haven't registry
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return new NextResponse("Bạn chưa đăng ký sự kiện này", { status: 404 });
    }
    console.error("LỖI KHI HỦY ĐĂNG KÝ:", error);
    return new NextResponse("Lỗi hệ thống", { status: 500 });
  }
}
