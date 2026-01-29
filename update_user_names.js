require('dotenv').config();
const { mongoose } = require('./src/models/mongoose');
const { User, Patient, Staff, LabNurse } = require('./src/models');

const updates = {
    patients: [
        {
            id: "6954660eb91ae7c0bcebb5d4",
            fullName: "Hoàng Lê Bảo Trâm",
            email: "hoanglebaotram@gmail.com"
        },
        {
            id: "695464a5b91ae7c0bcebb5ac",
            fullName: "Nguyễn Phan Minh Châu",
            email: "nguyenphanminhchau@gmail.com"
        },
        {
            id: "6941bcaac29e595ef1b6da80",
            fullName: "Ngô Hoàng Ngọc Đăng",
            email: "ngohoangngocdang@gmail.com"
        },
        {
            id: "692ec46dbff5675228f4e868",
            fullName: "Phạm Lê Minh Khang",
            email: "phamleminhkhang@gmail.com"
        }
    ],
    staffs: [
        {
            id: "692ec495bff5675228f4e86f",
            fullName: "Trần Ngọc Phương Trinh",
            email: "tranngocphuongtrinh@gmail.com"
        },
        {
            id: "6941d7c11501620a7d869f5b",
            fullName: "Nguyễn Đặng Tường Vy",
            email: "nguyendangtuongvy@gmail.com"
        }
    ],
    nurses: [
        {
            id: "692ec4a1bff5675228f4e876",
            fullName: "Hồ Thị Thu Na",
            email: "hothithuna@gmail.com"
        },
        {
            id: "694b56eb4c719e010203fb9c",
            fullName: "Võ Thị Thanh Thúy",
            email: "vothithanhthuy@gmail.com"
        }
    ]
};

async function update() {
    try {
        const dbUrl = process.env.DB_URL;
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        // Update Patients
        for (const item of updates.patients) {
            const profile = await Patient.findById(item.id);
            if (profile) {
                profile.fullName = item.fullName;
                await profile.save();

                if (profile.userId) {
                    await User.findByIdAndUpdate(profile.userId, { email: item.email });
                }
                console.log(`Updated Patient: ${item.fullName}`);
            }
        }

        // Update Staff
        for (const item of updates.staffs) {
            const profile = await Staff.findById(item.id);
            if (profile) {
                profile.fullName = item.fullName;
                await profile.save();

                if (profile.userId) {
                    await User.findByIdAndUpdate(profile.userId, { email: item.email });
                }
                console.log(`Updated Staff: ${item.fullName}`);
            }
        }

        // Update Nurses
        for (const item of updates.nurses) {
            const profile = await LabNurse.findById(item.id);
            if (profile) {
                profile.fullName = item.fullName;
                await profile.save();

                if (profile.userId) {
                    await User.findByIdAndUpdate(profile.userId, { email: item.email });
                }
                console.log(`Updated Nurse: ${item.fullName}`);
            }
        }

        console.log('Update completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating data:', error);
        process.exit(1);
    }
}

update();
