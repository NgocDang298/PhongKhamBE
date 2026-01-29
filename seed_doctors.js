require('dotenv').config();
const { mongoose } = require('./src/models/mongoose');
const { User, Doctor } = require('./src/models');
const bcrypt = require('bcryptjs');

const doctorsData = [
    {
        fullName: 'Phạm Hoàng Minh Quân',
        email: 'phamhoangminhquan@gmail.com',
        phone: '0901234561',
        cccd: '001001001001',
        specialty: 'Nhi Khoa',
        degree: 'Thạc sĩ Bác sĩ',
        birthYear: 1985,
        gender: 'male',
        workExperience: 10,
        address: 'Hà Nội'
    },
    {
        fullName: 'Nguyễn Trần Thu Thủy',
        email: 'nguyentranthuthuy@gmail.com',
        phone: '0901234562',
        cccd: '001001001002',
        specialty: 'Sản Phụ Khoa',
        degree: 'Bác sĩ Chuyên khoa I',
        birthYear: 1990,
        gender: 'female',
        workExperience: 7,
        address: 'Hải Phòng'
    },
    {
        fullName: 'Lê Hoàng Bảo Long',
        email: 'lehoangbaolong@gmail.com',
        phone: '0901234563',
        cccd: '001001001003',
        specialty: 'Ngoại Khoa',
        degree: 'Bác sĩ Chuyên khoa II',
        birthYear: 1978,
        gender: 'male',
        workExperience: 20,
        address: 'Đà Nẵng'
    },
    {
        fullName: 'Đặng Mai Phương Thảo',
        email: 'dangmaiphuongthao@gmail.com',
        phone: '0901234564',
        cccd: '001001001004',
        specialty: 'Mắt',
        degree: 'Bác sĩ',
        birthYear: 1992,
        gender: 'female',
        workExperience: 5,
        address: 'Cần Thơ'
    },
    {
        fullName: 'Vũ Ngô Gia Huy',
        email: 'vungogiahuy@gmail.com',
        phone: '0901234565',
        cccd: '001001001005',
        specialty: 'Da Liễu',
        degree: 'Tiến sĩ Bác sĩ',
        birthYear: 1982,
        gender: 'male',
        workExperience: 12,
        address: 'TP.HCM'
    }
];

async function seed() {
    try {
        const dbUrl = process.env.DB_URL;
        if (!dbUrl) throw new Error('DB_URL not found in .env');

        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        for (const data of doctorsData) {
            // Check if user exists
            const existingUser = await User.findOne({ cccd: data.cccd });
            if (existingUser) {
                console.log(`User with CCCD ${data.cccd} already exists, skipping...`);
                continue;
            }

            // Create User
            const user = await User.create({
                cccd: data.cccd,
                password: 'doctor123!', // Mật khẩu mặc định
                role: 'doctor',
                email: data.email,
                sdt: data.phone
            });

            // Create Doctor profile
            await Doctor.create({
                userId: user._id,
                fullName: data.fullName,
                specialty: data.specialty,
                degree: data.degree,
                birthYear: data.birthYear,
                workExperience: data.workExperience,
                gender: data.gender,
                address: data.address,
                status: 'active'
            });

            console.log(`Created doctor: ${data.fullName}`);
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
