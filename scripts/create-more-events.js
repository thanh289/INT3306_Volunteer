// Script to create more upcoming events for carousel
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const eventImages = [
  "uploads/events/1765151136969-p4xlm1.jpg",
  "uploads/events/1765151164739-khe2iz.jpg",
  "uploads/events/1765151239971-1090fq.jpg",
  "uploads/events/1765151263588-n32u01.jpg",
  "uploads/events/1765151303924-w0zke6.jpg",
  "uploads/events/1765151434983-rkdif0.jpg",
  "uploads/events/1765151607483-arjy5k.jpg",
  "uploads/events/1765151692908-h5l5rs.jpg",
  "uploads/events/1765151501441-bfl4bc.jpg",
];

const newEvents = [
  {
    title: "Workshop kỹ năng mềm cho sinh viên",
    description:
      "Tham gia workshop học kỹ năng giao tiếp, làm việc nhóm và thuyết trình cho sinh viên.",
    location: "Trường Đại học Bách Khoa Hà Nội",
    category: "EDUCATION",
    startDateTime: new Date("2025-01-15T09:00:00"),
    endDateTime: new Date("2025-01-15T16:00:00"),
    maxParticipants: 50,
  },
  {
    title: "Chiến dịch phủ xanh thành phố",
    description:
      "Cùng nhau trồng cây xanh tại các công viên và khu dân cư để cải thiện môi trường.",
    location: "Công viên Cầu Giấy, Hà Nội",
    category: "ENVIRONMENT",
    startDateTime: new Date("2025-01-20T07:00:00"),
    endDateTime: new Date("2025-01-20T11:00:00"),
    maxParticipants: 100,
  },
  {
    title: "Khám bệnh từ thiện tại vùng cao",
    description:
      "Đoàn y bác sĩ tình nguyện khám bệnh, phát thuốc miễn phí cho đồng bào vùng cao.",
    location: "Huyện Mù Cang Chải, Yên Bái",
    category: "HEALTHCARE",
    startDateTime: new Date("2025-01-25T08:00:00"),
    endDateTime: new Date("2025-01-27T17:00:00"),
    maxParticipants: 30,
  },
  {
    title: "Tết sum vầy - Mang Tết đến với người nghèo",
    description:
      "Chương trình trao quà Tết, nhu yếu phẩm cho người nghèo, người già neo đơn.",
    location: "Quận Long Biên, Hà Nội",
    category: "COMMUNITY",
    startDateTime: new Date("2025-01-28T08:00:00"),
    endDateTime: new Date("2025-01-28T17:00:00"),
    maxParticipants: 80,
  },
];

async function createEvents() {
  try {
    console.log("🔄 Checking for admin user...");

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      console.log("❌ No admin user found! Please create an admin user first.");
      return;
    }

    console.log(`✅ Found admin: ${admin.name || admin.email}`);
    console.log("🔄 Creating new upcoming events...");

    for (let i = 0; i < newEvents.length; i++) {
      const eventData = newEvents[i];
      const imageUrl = eventImages[i % eventImages.length];

      const event = await prisma.event.create({
        data: {
          ...eventData,
          imageUrl,
          status: "PUBLISHED",
          isDeleted: false,
          creatorId: admin.id,
        },
      });

      console.log(`✅ Created: "${event.title}" with image ${imageUrl}`);
    }

    console.log("\n🎉 Successfully created all events!");

    // Check total upcoming events
    const upcomingCount = await prisma.event.count({
      where: {
        startDateTime: { gte: new Date() },
        status: "PUBLISHED",
        isDeleted: false,
      },
    });

    console.log(`\n📊 Total upcoming events now: ${upcomingCount}`);
  } catch (error) {
    console.error("❌ Error creating events:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createEvents();
