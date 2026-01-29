require('dotenv').config();
const { mongoose } = require('./src/models/mongoose');
const { Doctor, WorkSchedule } = require('./src/models');

async function seedSchedules() {
    try {
        const dbUrl = process.env.DB_URL;
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        const doctors = await Doctor.find({ status: 'active' }).lean();
        console.log(`Found ${doctors.length} active doctors`);

        const scheduleTemplates = [
            // Standard JS: 0=Sun, 1=Mon, ..., 6=Sat
            { dayOfWeek: 0, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng (Chủ nhật)' }] },
            { dayOfWeek: 1, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng' }, { start: '13:00', end: '17:00', note: 'Ca chiều' }] },
            { dayOfWeek: 2, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng' }, { start: '13:00', end: '17:00', note: 'Ca chiều' }] },
            { dayOfWeek: 3, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng' }, { start: '13:00', end: '17:00', note: 'Ca chiều' }] },
            { dayOfWeek: 4, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng' }, { start: '13:00', end: '17:00', note: 'Ca chiều' }] },
            { dayOfWeek: 5, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng' }, { start: '13:00', end: '17:00', note: 'Ca chiều' }] },
            { dayOfWeek: 6, shifts: [{ start: '08:00', end: '12:00', note: 'Ca sáng' }, { start: '13:00', end: '17:00', note: 'Ca chiều' }] }
        ];

        for (const doctor of doctors) {
            console.log(`Processing schedule for: ${doctor.fullName} (${doctor._id})`);

            for (const template of scheduleTemplates) {
                for (const shift of template.shifts) {
                    // Kiểm tra xem lịch này đã tồn tại chưa
                    const existing = await WorkSchedule.findOne({
                        doctorId: doctor._id,
                        dayOfWeek: template.dayOfWeek,
                        shiftStart: shift.start,
                        shiftEnd: shift.end
                    });

                    if (!existing) {
                        await WorkSchedule.create({
                            doctorId: doctor._id,
                            dayOfWeek: template.dayOfWeek,
                            shiftStart: shift.start,
                            shiftEnd: shift.end,
                            note: shift.note
                        });
                        console.log(`  Added: Day ${template.dayOfWeek}, ${shift.start}-${shift.end}`);
                    }
                }
            }
        }

        console.log('Seeding schedules completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding schedules:', error);
        process.exit(1);
    }
}

seedSchedules();
