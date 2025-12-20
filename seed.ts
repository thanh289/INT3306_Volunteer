import { PrismaClient, Role, EventCategory, EventStatus, Gender, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Đang xóa dữ liệu cũ...');

    // Xóa tất cả dữ liệu cũ theo thứ tự để tránh lỗi foreign key
    await prisma.pushSubscription.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.eventInvitation.deleteMany();
    await prisma.eventManager.deleteMany();
    await prisma.interestedEvent.deleteMany();
    await prisma.registrationAnswer.deleteMany();
    await prisma.registrationQuestion.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.postComment.deleteMany();
    await prisma.postLike.deleteMany();
    await prisma.post.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Đã xóa dữ liệu cũ\n');

    // Mật khẩu mẫu: "Password123@" (đáp ứng tất cả yêu cầu validation)
    const hashedPassword = await bcrypt.hash('Password123@', 10);

    console.log('👥 Đang tạo users...');

    // 1 Admin
    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            email: 'admin@gmail.com',
            phone: '0901234567',
            address: 'Hà Nội',
            dateOfBirth: new Date('1990-01-15'),
            gender: Gender.MALE,
            passwordHash: hashedPassword,
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
        },
    });

    // 4 Event Managers
    const manager1 = await prisma.user.create({
        data: {
            name: 'Trần Duy Thành',
            email: 'tranduythanh2809@gmail.com',
            phone: '0912345678',
            address: 'Hồ Chí Minh',
            dateOfBirth: new Date('1992-05-20'),
            gender: Gender.FEMALE,
            passwordHash: hashedPassword,
            role: Role.EVENT_MANAGER,
            status: UserStatus.ACTIVE,
        },
    });

    const manager2 = await prisma.user.create({
        data: {
            name: 'Nguyễn Tuấn Nghĩa',
            email: 'tuannghianguyen161@gmail.com',
            phone: '0923456789',
            address: 'Đà Nẵng',
            dateOfBirth: new Date('1988-11-10'),
            gender: Gender.MALE,
            passwordHash: hashedPassword,
            role: Role.EVENT_MANAGER,
            status: UserStatus.ACTIVE,
        },
    });

    const manager3 = await prisma.user.create({
        data: {
            name: 'Dương Anh Tuấn',
            email: 'anhtuandepzai@gmail.com',
            phone: '0934567891',
            address: 'Cần Thơ',
            dateOfBirth: new Date('1991-08-25'),
            gender: Gender.FEMALE,
            passwordHash: hashedPassword,
            role: Role.EVENT_MANAGER,
            status: UserStatus.ACTIVE,
        },
    });

    const manager4 = await prisma.user.create({
        data: {
            name: 'Phan Văn Đức',
            email: 'duc@gmail.com',
            phone: '0945678902',
            address: 'Hải Phòng',
            dateOfBirth: new Date('1989-03-12'),
            gender: Gender.MALE,
            passwordHash: hashedPassword,
            role: Role.EVENT_MANAGER,
            status: UserStatus.ACTIVE,
        },
    });

    // 5 Volunteers
    const volunteer1 = await prisma.user.create({
        data: {
            name: 'djdjjdue',
            email: 'txrxtdtffrxrdt@gmail.com',
            phone: '0934567890',
            address: 'Hà Nội',
            dateOfBirth: new Date('2000-03-15'),
            gender: Gender.FEMALE,
            passwordHash: hashedPassword,
            role: Role.VOLUNTEER,
            status: UserStatus.ACTIVE,
        },
    });

    const volunteer2 = await prisma.user.create({
        data: {
            name: 'Hoàng Văn Tuấn',
            email: 'tuan.volunteer@gmail.com',
            phone: '0945678901',
            address: 'Hồ Chí Minh',
            dateOfBirth: new Date('1998-07-22'),
            gender: Gender.MALE,
            passwordHash: hashedPassword,
            role: Role.VOLUNTEER,
            status: UserStatus.ACTIVE,
        },
    });

    const volunteer3 = await prisma.user.create({
        data: {
            name: 'Vũ Thị Mai',
            email: 'mai.volunteer@gmail.com',
            phone: '0956789012',
            address: 'Hải Phòng',
            dateOfBirth: new Date('2001-12-05'),
            gender: Gender.FEMALE,
            passwordHash: hashedPassword,
            role: Role.VOLUNTEER,
            status: UserStatus.ACTIVE,
        },
    });

    const volunteer4 = await prisma.user.create({
        data: {
            name: 'Đỗ Văn Nam',
            email: 'nam.volunteer@gmail.com',
            phone: '0967890123',
            address: 'Cần Thơ',
            dateOfBirth: new Date('1999-09-18'),
            gender: Gender.MALE,
            passwordHash: hashedPassword,
            role: Role.VOLUNTEER,
            status: UserStatus.ACTIVE,
        },
    });

    const volunteer5 = await prisma.user.create({
        data: {
            name: 'Bùi Thị Thảo',
            email: 'thao.volunteer@gmail.com',
            phone: '0978901234',
            address: 'Đà Nẵng',
            dateOfBirth: new Date('2002-04-30'),
            gender: Gender.FEMALE,
            passwordHash: hashedPassword,
            role: Role.VOLUNTEER,
            status: UserStatus.ACTIVE,
        },
    });

    console.log('✅ Đã tạo users\n');

    console.log('🎯 Đang tạo events...');

    const creators = [manager1, manager2, manager3, manager4];
    const allUsers = [admin, manager1, manager2, manager3, manager4, volunteer1, volunteer2, volunteer3, volunteer4, volunteer5];
    const now = new Date();

    // 25 sự kiện với nhiều thể loại khác nhau
    const events = [
        // ENVIRONMENT - 8 sự kiện
        {
            title: 'Chiến dịch làm sạch bờ biển Nha Trang',
            description: 'Tham gia cùng chúng tôi dọn rác tại bãi biển Nha Trang, bảo vệ môi trường biển và hệ sinh thái dưới nước.',
            location: 'Bãi biển Trần Phú, Nha Trang, Khánh Hòa',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            maxAttendees: 100,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[0].id,
        },
        {
            title: 'Trồng cây xanh tại công viên Thống Nhất',
            description: 'Hãy cùng nhau trồng cây xanh để cải thiện không khí và tạo không gian xanh cho thành phố.',
            location: 'Công viên Thống Nhất, Hai Bà Trưng, Hà Nội',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 80,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },
        {
            title: 'Dọn dẹp rác thải nhựa ven sông Hồng',
            description: 'Chiến dịch thu gom rác thải nhựa dọc bờ sông Hồng, góp phần bảo vệ nguồn nước sạch cho cộng đồng.',
            location: 'Bờ sông Hồng, Long Biên, Hà Nội',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            maxAttendees: 60,
            status: EventStatus.PUBLISHED,
            requirePostApproval: true,
            creatorId: creators[2].id,
        },
        {
            title: 'Tái chế và phân loại rác thải tại trường học',
            description: 'Hướng dẫn học sinh cách phân loại rác thải và tái chế, xây dựng ý thức bảo vệ môi trường từ nhỏ.',
            location: 'Trường THPT Chu Văn An, Hoàn Kiếm, Hà Nội',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            maxAttendees: 50,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[3].id,
        },
        {
            title: 'Làm sạch rừng ngập mặn Cần Giờ',
            description: 'Tham gia bảo vệ rừng ngập mặn, dọn dẹp rác thải và trồng cây bảo vệ hệ sinh thái ven biển.',
            location: 'Khu dự trữ sinh quyển Cần Giờ, TP. Hồ Chí Minh',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
            maxAttendees: 70,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },
        {
            title: 'Chiến dịch Zero Waste tại chợ truyền thống',
            description: 'Khuyến khích người dân giảm thiểu rác thải nhựa, sử dụng túi vải và bao bì thân thiện môi trường.',
            location: 'Chợ Bến Thành, Quận 1, TP. Hồ Chí Minh',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 40,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[2].id,
        },
        {
            title: 'Bảo vệ động vật hoang dã tại vườn quốc gia',
            description: 'Tham gia giám sát và bảo vệ các loài động vật quý hiếm, tuyên truyền về đa dạng sinh học.',
            location: 'Vườn Quốc gia Cúc Phương, Ninh Bình',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000),
            maxAttendees: 30,
            status: EventStatus.PUBLISHED,
            requirePostApproval: true,
            creatorId: creators[0].id,
        },
        {
            title: 'Làm vườn cộng đồng và trồng rau hữu cơ',
            description: 'Cùng nhau xây dựng vườn rau sạch cho cộng đồng, học cách trồng rau hữu cơ không hóa chất.',
            location: 'Khu dân cư Vinhomes, Long Biên, Hà Nội',
            category: EventCategory.ENVIRONMENT,
            startDateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            maxAttendees: 50,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },

        // EDUCATION - 7 sự kiện
        {
            title: 'Dạy tiếng Anh miễn phí cho trẻ em vùng cao',
            description: 'Tình nguyện giảng dạy tiếng Anh cơ bản cho học sinh miền núi, giúp các em có cơ hội tiếp cận kiến thức.',
            location: 'Trường Tiểu học Tà Xùa, Yên Bái',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            maxAttendees: 20,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            requiresRegistrationForm: true,
            creatorId: creators[2].id,
        },
        {
            title: 'Trao tặng sách và xây dựng thư viện mini',
            description: 'Quyên góp sách và xây dựng thư viện nhỏ tại các trường học vùng sâu, vùng xa.',
            location: 'Trường THCS Măng Đen, Kon Tum',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
            maxAttendees: 25,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[0].id,
        },
        {
            title: 'Hướng nghiệp và tư vấn học tập cho học sinh',
            description: 'Chia sẻ kinh nghiệm, định hướng nghề nghiệp và phương pháp học tập hiệu quả cho học sinh THPT.',
            location: 'Trường THPT Lê Quý Đôn, Quận 3, TP. Hồ Chí Minh',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 100,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },
        {
            title: 'Kỹ năng sống và giáo dục tài chính cho thiếu niên',
            description: 'Dạy các kỹ năng sống cần thiết và kiến thức quản lý tài chính cá nhân cho học sinh cấp 2.',
            location: 'Nhà Văn hóa Thanh niên, Hai Bà Trưng, Hà Nội',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            maxAttendees: 60,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            requiresRegistrationForm: true,
            creatorId: creators[2].id,
        },
        {
            title: 'Dạy lập trình cơ bản cho trẻ em',
            description: 'Giới thiệu lập trình Scratch và tư duy logic cho học sinh tiểu học, khơi dậy đam mê công nghệ.',
            location: 'Trung tâm STEM, Cầu Giấy, Hà Nội',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 40,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[0].id,
        },
        {
            title: 'Lớp học âm nhạc miễn phí cho trẻ khuyết tật',
            description: 'Dạy nhạc cụ cơ bản và âm nhạc trị liệu cho trẻ em có hoàn cảnh khó khăn.',
            location: 'Trung tâm Chăm sóc Trẻ Khuyết tật, Đống Đa, Hà Nội',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            maxAttendees: 15,
            status: EventStatus.PUBLISHED,
            requirePostApproval: true,
            requiresRegistrationForm: true,
            creatorId: creators[1].id,
        },
        {
            title: 'Workshop về sáng tạo nội dung và viết lách',
            description: 'Hướng dẫn kỹ năng viết bài, sáng tạo nội dung và kể chuyện cho thanh thiếu niên.',
            location: 'Không gian Sáng tạo, Quận 1, TP. Hồ Chí Minh',
            category: EventCategory.EDUCATION,
            startDateTime: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 35,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[2].id,
        },

        // HEALTHCARE - 5 sự kiện
        {
            title: 'Khám bệnh và cấp thuốc miễn phí cho người nghèo',
            description: 'Đội ngũ y bác sĩ tình nguyện khám chữa bệnh và cấp phát thuốc miễn phí cho bà con vùng khó khăn.',
            location: 'Xã Đại Lãnh, Bắc Kạn',
            category: EventCategory.HEALTHCARE,
            startDateTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
            maxAttendees: 30,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            requiresRegistrationForm: true,
            creatorId: creators[0].id,
        },
        {
            title: 'Hiến máu nhân đạo cứu người',
            description: 'Chiến dịch hiến máu tình nguyện, mỗi giọt máu cho đi là một cơ hội sống cho người khác.',
            location: 'Viện Huyết học Truyền máu TW, Hai Bà Trưng, Hà Nội',
            category: EventCategory.HEALTHCARE,
            startDateTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
            maxAttendees: 150,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },
        {
            title: 'Hướng dẫn sơ cấp cứu và an toàn lao động',
            description: 'Đào tạo kỹ năng sơ cấp cứu cơ bản, xử lý tình huống khẩn cấp và an toàn trong lao động.',
            location: 'Trung tâm Văn hóa Lao động, Quận 10, TP. Hồ Chí Minh',
            category: EventCategory.HEALTHCARE,
            startDateTime: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            maxAttendees: 80,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            requiresRegistrationForm: true,
            creatorId: creators[2].id,
        },
        {
            title: 'Tư vấn dinh dưỡng và chăm sóc sức khỏe cộng đồng',
            description: 'Tư vấn chế độ ăn uống lành mạnh, phòng bệnh và chăm sóc sức khỏe cho người dân.',
            location: 'Trạm Y tế Phường Đông Hòa, Dĩ An, Bình Dương',
            category: EventCategory.HEALTHCARE,
            startDateTime: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 50,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[0].id,
        },
        {
            title: 'Chăm sóc và thăm hỏi người cao tuổi',
            description: 'Thăm hỏi, trò chuyện và hỗ trợ người cao tuổi tại viện dưỡng lão, mang đến niềm vui cho các cụ.',
            location: 'Viện Dưỡng lão Hà Đông, Hà Nội',
            category: EventCategory.HEALTHCARE,
            startDateTime: new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 40,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },

        // COMMUNITY - 5 sự kiện
        {
            title: 'Xây nhà tình thương cho hộ nghèo',
            description: 'Chung tay xây dựng ngôi nhà tình thương cho gia đình có hoàn cảnh khó khăn.',
            location: 'Xã Ia Tul, Ia Grai, Gia Lai',
            category: EventCategory.COMMUNITY,
            startDateTime: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
            maxAttendees: 40,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            requiresRegistrationForm: true,
            creatorId: creators[2].id,
        },
        {
            title: 'Tổ chức Tết Trung thu cho trẻ em nghèo',
            description: 'Mang niềm vui Trung thu đến với các em nhỏ có hoàn cảnh khó khăn với bánh kẹo và phần quà.',
            location: 'Trung tâm Bảo trợ Trẻ em, Gò Vấp, TP. Hồ Chí Minh',
            category: EventCategory.COMMUNITY,
            startDateTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            maxAttendees: 60,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[0].id,
        },
        {
            title: 'Hỗ trợ người vô gia cư trong mùa đông',
            description: 'Trao quần áo ấm, chăn màn và suất ăn cho người vô gia cư trong những ngày giá lạnh.',
            location: 'Khu vực Ga Hà Nội, Hoàn Kiếm, Hà Nội',
            category: EventCategory.COMMUNITY,
            startDateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
            maxAttendees: 50,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[1].id,
        },
        {
            title: 'Tình nguyện mùa thi cho học sinh',
            description: 'Hỗ trợ học sinh tham gia kỳ thi với nước uống, hướng dẫn đường và động viên tinh thần.',
            location: 'Trường ĐH Bách Khoa Hà Nội, Hai Bà Trưng, Hà Nội',
            category: EventCategory.COMMUNITY,
            startDateTime: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
            maxAttendees: 100,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[2].id,
        },
        {
            title: 'Đêm nhạc gây quỹ từ thiện',
            description: 'Tổ chức đêm nhạc từ thiện, toàn bộ tiền vé sẽ được dùng để hỗ trợ trẻ em mồ côi.',
            location: 'Nhà hát Lớn Hà Nội, Hoàn Kiếm, Hà Nội',
            category: EventCategory.COMMUNITY,
            startDateTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            endDateTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
            maxAttendees: 200,
            status: EventStatus.PUBLISHED,
            requirePostApproval: false,
            creatorId: creators[0].id,
        },
    ];

    // Tạo tất cả events
    const createdEvents = [];
    for (const eventData of events) {
        const event = await prisma.event.create({
            data: eventData,
        });
        createdEvents.push(event);
    }

    console.log(`✅ Đã tạo ${events.length} events\n`);

    console.log('📝 Đang tạo posts và comments...');

    // Tạo posts cho một số events (khoảng 10 events có posts)
    const eventsWithPosts = createdEvents.slice(0, 10);

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
    ];

    let totalPosts = 0;
    let totalComments = 0;

    for (const event of eventsWithPosts) {
        // Mỗi event có 2-4 posts
        const numPosts = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < numPosts; i++) {
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            const randomContent = postContents[Math.floor(Math.random() * postContents.length)];

            const post = await prisma.post.create({
                data: {
                    content: randomContent,
                    eventId: event.id,
                    authorId: randomUser.id,
                    postStatus: 'APPROVED',
                    createdAt: new Date(event.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
                },
            });

            totalPosts++;

            // Mỗi post có 1-5 comments
            const numComments = Math.floor(Math.random() * 5) + 1;

            for (let j = 0; j < numComments; j++) {
                const randomCommenter = allUsers[Math.floor(Math.random() * allUsers.length)];
                // Đảm bảo người comment khác người post
                if (randomCommenter.id === randomUser.id && allUsers.length > 1) {
                    continue;
                }

                const randomComment = commentContents[Math.floor(Math.random() * commentContents.length)];

                await prisma.postComment.create({
                    data: {
                        content: randomComment,
                        postId: post.id,
                        userId: randomCommenter.id,
                        createdAt: new Date(post.createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000),
                    },
                });

                totalComments++;
            }

            // Thêm likes cho posts (random 1-8 likes)
            const numLikes = Math.floor(Math.random() * 8) + 1;
            const likedUsers = new Set();

            for (let k = 0; k < numLikes; k++) {
                const randomLiker = allUsers[Math.floor(Math.random() * allUsers.length)];

                if (!likedUsers.has(randomLiker.id)) {
                    likedUsers.add(randomLiker.id);

                    await prisma.postLike.create({
                        data: {
                            postId: post.id,
                            userId: randomLiker.id,
                            createdAt: new Date(post.createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000),
                        },
                    });
                }
            }
        }
    }

    console.log(`✅ Đã tạo ${totalPosts} posts và ${totalComments} comments\n`);

    console.log('📊 Tổng kết:');
    console.log(`- Admins: 1`);
    console.log(`- Event Managers: 4`);
    console.log(`- Volunteers: 5`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Posts: ${totalPosts}`);
    console.log(`- Comments: ${totalComments}`);
    console.log(`\n🔑 Thông tin đăng nhập:`);
    console.log(`Mật khẩu chung cho tất cả users: Password123@`);
    console.log(`\nEmail accounts:`);
    console.log(`- Admin: admin@gmail.com`);
    console.log(`- Manager 1: lan.manager@gmail.com`);
    console.log(`- Manager 2: minh.manager@gmail.com`);
    console.log(`- Manager 3: ha.manager@gmail.com`);
    console.log(`- Manager 4: duc.manager@gmail.com`);
    console.log(`- Volunteers: huong.volunteer@gmail.com, tuan.volunteer@gmail.com, etc.`);
}

main()
    .catch((e) => {
        console.error('❌ Lỗi:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });