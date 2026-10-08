import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function hash(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log('🌱 Starting SIT Campus Event Ticketing database seed...');

  // Clean existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await hash('Password123!');

  // 1. Create Demo Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sit.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Siddalingaiah (Dean Student Welfare)',
      role: 'ADMIN',
      department: 'Dean Student Affairs, SIT',
      usn: 'FAC-SIT-ADMIN-01',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@sit.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Prof. Kiran Kumar (IEEE SIT Counselor)',
      role: 'ORGANIZER',
      department: 'Information Science & Engineering',
      usn: 'FAC-SIT-ISE-04',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student@sit.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Raghavendra Rao',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      usn: '1SI22CS101',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'ananya@sit.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Ananya Sharma',
      role: 'STUDENT',
      department: 'Electronics & Communication',
      usn: '1SI22EC042',
    },
  });

  const gateStaff = await prisma.user.create({
    data: {
      email: 'gate@sit.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Suresh Gowda (Security Gate Lead)',
      role: 'GATE_STAFF',
      department: 'Campus Security & Operations',
      usn: 'STAFF-SIT-SEC-12',
    },
  });

  console.log('✅ Demo Users created:');
  console.log('   - Admin:      admin@sit.ac.in      (Password123!)');
  console.log('   - Organizer:  organizer@sit.ac.in  (Password123!)');
  console.log('   - Student:    student@sit.ac.in    (Password123!)');
  console.log('   - Gate Staff: gate@sit.ac.in       (Password123!)');

  // 2. Create Realistic Campus Events
  const now = new Date();

  const hackathon = await prisma.event.create({
    data: {
      title: 'SIT TECHHACK 2026: 36-Hour Flagship Hackathon',
      description:
        'SIT’s premier national hackathon bringing together 300+ collegiate developers, designers, and innovators. Tracks include Agentic AI, Cyber-Physical Systems, FinTech, and Green Tech. Cash prizes worth ₹2,50,000 + incubation opportunities.',
      category: 'HACKATHON',
      venue: 'CS/IS Advanced Computing Labs & Incubation Center, SIT Campus',
      startDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      totalCapacity: 120,
      availableCapacity: 118, // 2 bookings seeded below
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      organizerId: organizer.id,
    },
  });

  const halcyon = await prisma.event.create({
    data: {
      title: 'HALCYON 2026: National Cultural Extravaganza',
      description:
        'The legendary annual cultural festival of Siddaganga Institute of Technology. Features Battle of the Bands, Classical Solo Dance, Pro-Nite Concert featuring top national artists, Fashion Walk, and theatrical performances.',
      category: 'CULTURAL',
      venue: 'Silver Jubilee Auditorium & Open Air Theatre, SIT',
      startDateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      endDateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      totalCapacity: 500,
      availableCapacity: 500,
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      organizerId: organizer.id,
    },
  });

  const aiWorkshop = await prisma.event.create({
    data: {
      title: 'Hands-on Workshop: Building Autonomous AI with LLMs & DevOps',
      description:
        'Deep-dive technical workshop on building production-ready autonomous agent pipelines using Google Gemini 2.0, Docker containerization, and modern observability stacks. Hands-on code labs with industry mentors.',
      category: 'WORKSHOP',
      venue: 'Media Center Seminar Hall, SIT Campus',
      startDateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endDateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      totalCapacity: 60,
      availableCapacity: 60,
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      organizerId: organizer.id,
    },
  });

  const roboWars = await prisma.event.create({
    data: {
      title: 'RoboWars 2026: Combat Robotics Championship',
      description:
        'Heavyweight and featherweight combat bots battle in the reinforced steel cage. Organised by SIT Robotics Club. Featuring pneumatic flippers, high-speed spinners, and autonomous obstacle navigation.',
      category: 'TECHNICAL',
      venue: 'Mechanical Engineering Quadrangle, SIT',
      startDateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      totalCapacity: 200,
      availableCapacity: 200,
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      organizerId: organizer.id,
    },
  });

  const sportsChampionship = await prisma.event.create({
    data: {
      title: 'SIT Inter-Collegiate Cricket & Badminton Invitational',
      description:
        'Inter-collegiate sports tournament with 24 teams from across Karnataka competing for the Dr. Sree Sree Shivakumara Swamiji Memorial Trophy. Professional umpiring and live streaming on campus screens.',
      category: 'SPORTS',
      venue: 'Dr. Sree Sree Shivakumara Swamiji Stadium, SIT',
      startDateTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      totalCapacity: 350,
      availableCapacity: 350,
      status: 'PUBLISHED',
      bannerUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
      organizerId: organizer.id,
    },
  });

  console.log('✅ 5 Realistic Campus Events created');

  // 3. Create Demo Bookings & Tickets
  // Booking 1: student1 for TechHack (Status: VALID, ready for live gate scan demonstration)
  const booking1 = await prisma.booking.create({
    data: {
      bookingReference: 'BK-TECHHACK-001',
      userId: student1.id,
      eventId: hackathon.id,
      status: 'CONFIRMED',
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      ticketCode: 'TKT-SIT-TH01',
      qrPayload: 'TKT_PASS_SIT_TECHHACK_STUDENT1_VALID_TOKEN',
      bookingId: booking1.id,
      status: 'VALID',
    },
  });

  // Booking 2: student2 for TechHack (Status: USED, demonstrated entry at gate)
  const booking2 = await prisma.booking.create({
    data: {
      bookingReference: 'BK-TECHHACK-002',
      userId: student2.id,
      eventId: hackathon.id,
      status: 'CONFIRMED',
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketCode: 'TKT-SIT-TH02',
      qrPayload: 'TKT_PASS_SIT_TECHHACK_STUDENT2_USED_TOKEN',
      bookingId: booking2.id,
      status: 'USED',
      validatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Validated 2 hours ago
      validatedById: gateStaff.id,
      entryNotes: 'Student verified via College RFID + QR Pass at Gate 2',
    },
  });

  // 4. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        userId: admin.id,
        metadata: JSON.stringify({ institute: 'SIT Tumakuru', academicYear: '2026-27' }),
      },
      {
        action: 'EVENT_PUBLISH',
        entityType: 'EVENT',
        entityId: hackathon.id,
        userId: organizer.id,
        metadata: JSON.stringify({ title: hackathon.title }),
      },
      {
        action: 'BOOKING_CREATE',
        entityType: 'BOOKING',
        entityId: booking1.id,
        userId: student1.id,
        metadata: JSON.stringify({ ticketCode: ticket1.ticketCode, eventTitle: hackathon.title }),
      },
      {
        action: 'TICKET_VALIDATED_SUCCESS',
        entityType: 'TICKET',
        entityId: ticket2.id,
        userId: gateStaff.id,
        metadata: JSON.stringify({
          ticketCode: ticket2.ticketCode,
          attendeeName: student2.name,
          eventTitle: hackathon.title,
        }),
      },
    ],
  });

  console.log('✅ Seed bookings, digital tickets, and audit trails created successfully');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
