import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Đang xóa posts và comments cũ...');

    // Xóa chỉ posts và comments
    await prisma.postComment.deleteMany();
    await prisma.postLike.deleteMany();
    await prisma.post.deleteMany();

    console.log('✅ Đã xóa posts và comments cũ\n');

    console.log('📝 Đang tạo posts và comments mới...');

    // Lấy tất cả users và events hiện có
    const allUsers = await prisma.user.findMany();
    const allEvents = await prisma.event.findMany({
        where: {
            isDeleted: false,
            isCancelled: false,
            status: 'PUBLISHED',
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    console.log(`Tìm thấy ${allUsers.length} users và ${allEvents.length} events`);

    const postContents = [
        'Sự kiện rất ý nghĩa! Mọi người hãy tham gia đông đảo nhé 🎉',
        'Mình đã đăng ký rồi, rất mong chờ được tham gia!',
        'Có ai đi cùng không? Inbox mình nhé!',
        'Lần đầu tham gia sự kiện thiện nguyện, hơi lo lắng nhưng rất háo hức 😊',
        'Cảm ơn BTC đã tổ chức sự kiện tuyệt vời này!',
        'Địa điểm tập trung ở đâu vậy mọi người?',
        'Cần chuẩn bị gì không các bạn? Mình mới tham gia lần đầu',
        'Sự kiện năm ngoái rất tuyệt, năm nay chắc chắn sẽ tham gia!',
        'Mọi người nhớ đi đúng giờ để không bị lỡ nha',
        'Rất vui được đóng góp một phần nhỏ cho cộng đồng ❤️',
        'BTC có cung cấp nước uống không nhỉ?',
        'Mình sẽ rủ thêm bạn bè cùng đi!',
        'Hy vọng trời đẹp để sự kiện diễn ra thuận lợi',
        'Có cần đăng ký trước không các bạn?',
        'Sự kiện này phù hợp cho học sinh tham gia không?',
        'Tuyệt vời! Chắc chắn sẽ tham gia 💪',
        'Đây là cơ hội tốt để làm điều có ý nghĩa',
        'Mình rất thích các hoạt động thiện nguyện như này',
        'Ai có kinh nghiệm chỉ mình với ạ!',
        'Rất mong được gặp mọi người tại sự kiện',
        'Lịch trình chi tiết như thế nào vậy?',
        'Có giới hạn độ tuổi không ạ?',
        'Mình có thể đi một mình được không?',
        'Sự kiện có được livestream không nhỉ?',
        'Mọi người có đi ăn uống gì sau sự kiện không?',
    ];

    const commentContents = [
        'Mình cũng nghĩ vậy!',
        'Đồng ý luôn 👍',
        'Cảm ơn bạn đã chia sẻ!',
        'Mình cũng rất mong chờ',
        'Hay quá, hẹn gặp bạn ở đó nhé!',
        'BTC sẽ công bố thông tin chi tiết sớm thôi',
        'Mình cũng lo như bạn, nhưng chắc sẽ vui lắm',
        'Lần đầu thì hơi ngại thôi, sau sẽ quen mà',
        'Bạn có thể inbox mình, mình cũng đi một mình',
        'Nhớ mang theo nước uống và kem chống nắng nha',
        'Đúng rồi, năm ngoái tuyệt lắm!',
        'Mình đã tham gia nhiều lần, rất đáng để trải nghiệm!',
        'Cùng nhau làm điều ý nghĩa 💪',
        'Ủng hộ tinh thần!',
        'Hẹn gặp mọi người!',
        'Cảm ơn bạn nhiều nha!',
        'Mình cũng vậy 😊',
        'Chúc bạn may mắn!',
        'Đúng là sự kiện rất hay!',
        'Mình đồng hành cùng bạn!',
        'Cảm ơn BTC đã tổ chức!',
        'Rất hữu ích, cảm ơn bạn!',
        'Mình cũng đang tìm người đi cùng',
        'Bạn có thể xem thông tin chi tiết trên page',
        'Chắc chắn sẽ rất vui!',
    ];

    let totalPosts = 0;
    let totalComments = 0;
    let totalLikes = 0;

    // Tạo posts cho tất cả events
    for (const event of allEvents) {
        // Mỗi event có 2-5 posts
        const numPosts = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < numPosts; i++) {
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            const randomContent = postContents[Math.floor(Math.random() * postContents.length)];

            // Tạo post trong khoảng thời gian từ khi event được tạo đến trước khi event bắt đầu
            const eventCreatedTime = event.createdAt.getTime();
            const eventStartTime = event.startDateTime.getTime();
            const timeRange = eventStartTime - eventCreatedTime;
            const randomTime = eventCreatedTime + Math.random() * timeRange * 0.8; // 80% khoảng thời gian

            const post = await prisma.post.create({
                data: {
                    content: randomContent,
                    eventId: event.id,
                    authorId: randomUser.id,
                    postStatus: 'APPROVED',
                    createdAt: new Date(randomTime),
                },
            });

            totalPosts++;

            // Mỗi post có 1-6 comments
            const numComments = Math.floor(Math.random() * 6) + 1;
            const commentedUsers = new Set([randomUser.id]); // Người post không comment chính post của mình

            for (let j = 0; j < numComments; j++) {
                let randomCommenter;
                let attempts = 0;

                // Tìm user chưa comment (nếu có đủ users)
                do {
                    randomCommenter = allUsers[Math.floor(Math.random() * allUsers.length)];
                    attempts++;
                } while (commentedUsers.has(randomCommenter.id) && attempts < 10 && allUsers.length > 1);

                if (commentedUsers.has(randomCommenter.id)) continue;

                commentedUsers.add(randomCommenter.id);
                const randomComment = commentContents[Math.floor(Math.random() * commentContents.length)];

                // Comment được tạo sau post, trong vòng 1-3 ngày
                const commentTime = randomTime + Math.random() * 3 * 24 * 60 * 60 * 1000;

                await prisma.postComment.create({
                    data: {
                        content: randomComment,
                        postId: post.id,
                        userId: randomCommenter.id,
                        createdAt: new Date(commentTime),
                    },
                });

                totalComments++;
            }

            // Thêm likes cho posts (random 2-10 likes)
            const numLikes = Math.floor(Math.random() * 9) + 2;
            const likedUsers = new Set();

            for (let k = 0; k < numLikes && k < allUsers.length; k++) {
                let randomLiker;
                let attempts = 0;

                do {
                    randomLiker = allUsers[Math.floor(Math.random() * allUsers.length)];
                    attempts++;
                } while (likedUsers.has(randomLiker.id) && attempts < 20);

                if (likedUsers.has(randomLiker.id)) continue;

                likedUsers.add(randomLiker.id);

                // Like được tạo sau post, trong vòng 2 ngày
                const likeTime = randomTime + Math.random() * 2 * 24 * 60 * 60 * 1000;

                try {
                    await prisma.postLike.create({
                        data: {
                            postId: post.id,
                            userId: randomLiker.id,
                            createdAt: new Date(likeTime),
                        },
                    });
                    totalLikes++;
                } catch (e) {
                    // Bỏ qua lỗi duplicate nếu có
                }
            }
        }
    }

    console.log(`✅ Đã tạo thành công!\n`);

    console.log('📊 Tổng kết:');
    console.log(`- Posts: ${totalPosts}`);
    console.log(`- Comments: ${totalComments}`);
    console.log(`- Likes: ${totalLikes}`);
    console.log(`- Trung bình: ${(totalPosts / allEvents.length).toFixed(1)} posts/event`);
    console.log(`- Trung bình: ${(totalComments / totalPosts).toFixed(1)} comments/post`);
    console.log(`- Trung bình: ${(totalLikes / totalPosts).toFixed(1)} likes/post`);
}

main()
    .catch((e) => {
        console.error('❌ Lỗi:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });