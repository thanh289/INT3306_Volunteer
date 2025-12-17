// Script to update event images from uploads/events folder
// Run with: node scripts/update-event-images.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const eventImages = [
  'uploads/events/1765151136969-p4xlm1.jpg',
  'uploads/events/1765151164739-khe2iz.jpg',
  'uploads/events/1765151239971-1090fq.jpg',
  'uploads/events/1765151263588-n32u01.jpg',
  'uploads/events/1765151303924-w0zke6.jpg',
  'uploads/events/1765151434983-rkdif0.jpg',
  'uploads/events/1765151607483-arjy5k.jpg',
  'uploads/events/1765151692908-h5l5rs.jpg',
  'uploads/events/1765151501441-bfl4bc.jpg',
];

async function updateEventImages() {
  try {
    console.log('🔄 Fetching upcoming events without images...');
    
    // Get upcoming events without images, ordered by start date
    const events = await prisma.event.findMany({
      where: {
        startDateTime: { gte: new Date() },
        status: 'PUBLISHED',
        isDeleted: false,
        OR: [
          { imageUrl: null },
          { imageUrl: '' }
        ]
      },
      orderBy: { startDateTime: 'asc' },
      take: 9,
    });

    console.log(`📊 Found ${events.length} events without images`);

    if (events.length === 0) {
      console.log('✅ All events already have images!');
      return;
    }

    // Update each event with an image
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const imageUrl = eventImages[i % eventImages.length]; // Loop through images if needed
      
      await prisma.event.update({
        where: { id: event.id },
        data: { imageUrl }
      });
      
      console.log(`✅ Updated "${event.title}" with image: ${imageUrl}`);
    }

    console.log('\n🎉 Successfully updated all event images!');
  } catch (error) {
    console.error('❌ Error updating event images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateEventImages();
