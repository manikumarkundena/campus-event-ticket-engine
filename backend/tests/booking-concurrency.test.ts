import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

describe('Booking Integrity & Concurrency Race Condition Suite', () => {
  let organizerId: string;
  let testStudents: Array<{ id: string; email: string; token: string }> = [];

  beforeAll(async () => {
    await prisma.$connect();

    // 1. Get organizer
    const organizer = await prisma.user.findUnique({
      where: { email: 'organizer@sit.ac.in' },
    });
    organizerId = organizer!.id;

    // 2. Create 10 distinct students for concurrency testing
    const pwHash = await bcrypt.hash('TestPass123!', 10);
    testStudents = [];

    for (let i = 1; i <= 10; i++) {
      const email = `concurrency.student.${Date.now()}.${i}@sit.ac.in`;
      const student = await prisma.user.create({
        data: {
          email,
          passwordHash: pwHash,
          name: `Concurrent Student ${i}`,
          role: 'STUDENT',
          department: 'CSE',
          usn: `1SI22CS${800 + i}`,
        },
      });

      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'TestPass123!' });

      testStudents.push({
        id: student.id,
        email,
        token: loginRes.body.data.token,
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Normal booking flow: student reserves ticket, capacity decrements, valid ticket generated', async () => {
    // Create an event with capacity = 5
    const now = new Date();
    const event = await prisma.event.create({
      data: {
        title: 'Single Booking Test Event',
        description: 'Test event for standard booking flow verification',
        category: 'WORKSHOP',
        venue: 'Lab 3, SIT',
        startDateTime: new Date(now.getTime() + 24 * 3600000),
        endDateTime: new Date(now.getTime() + 28 * 3600000),
        totalCapacity: 5,
        availableCapacity: 5,
        status: 'PUBLISHED',
        organizerId,
      },
    });

    const student = testStudents[0];
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ eventId: event.id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking.bookingReference).toBeDefined();
    expect(res.body.data.ticket.ticketCode).toBeDefined();
    expect(res.body.data.ticket.qrPayload).toBeDefined();
    expect(res.body.data.ticket.status).toBe('VALID');

    // Verify remaining capacity in DB decremented by 1
    const updatedEvent = await prisma.event.findUnique({ where: { id: event.id } });
    expect(updatedEvent!.availableCapacity).toBe(4);
  });

  it('Duplicate Booking Prevention: student cannot book the same event twice', async () => {
    const now = new Date();
    const event = await prisma.event.create({
      data: {
        title: 'Duplicate Test Event',
        description: 'Testing duplicate prevention',
        category: 'TECHNICAL',
        venue: 'Room 101, SIT',
        startDateTime: new Date(now.getTime() + 24 * 3600000),
        endDateTime: new Date(now.getTime() + 28 * 3600000),
        totalCapacity: 10,
        availableCapacity: 10,
        status: 'PUBLISHED',
        organizerId,
      },
    });

    const student = testStudents[1];

    // First booking attempt -> Success
    const res1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ eventId: event.id });
    expect(res1.status).toBe(201);

    // Second booking attempt by SAME student -> 409 Conflict
    const res2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ eventId: event.id });
    expect(res2.status).toBe(409);
    expect(res2.body.error).toContain('already reserved');
  });

  it('CRITICAL CONCURRENCY RACE CONDITION: Exactly 1 ticket remaining, 10 simultaneous bookings -> Exactly 1 success, 9 rejections, capacity == 0', async () => {
    // Create an event with STRICTLY 1 SEAT AVAILABLE
    const now = new Date();
    const scarceEvent = await prisma.event.create({
      data: {
        title: 'High-Demand VIP Masterclass (Scarce Capacity = 1)',
        description: 'Exclusive masterclass with strictly 1 seat available to test atomic race condition handling.',
        category: 'WORKSHOP',
        venue: 'Executive Seminar Room, SIT',
        startDateTime: new Date(now.getTime() + 48 * 3600000),
        endDateTime: new Date(now.getTime() + 52 * 3600000),
        totalCapacity: 1,
        availableCapacity: 1,
        status: 'PUBLISHED',
        organizerId,
      },
    });

    // 10 distinct students submit simultaneous booking requests at the exact same instant
    const promises = testStudents.map((st) =>
      request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${st.token}`)
        .send({ eventId: scarceEvent.id })
    );

    const responses = await Promise.all(promises);

    const successfulBookings = responses.filter((r) => r.status === 201);
    const capacityExceededBookings = responses.filter((r) => r.status === 409);

    // CRITICAL ASSERTION: Exactly 1 student must succeed
    expect(successfulBookings.length).toBe(1);

    // CRITICAL ASSERTION: Exactly 9 students must be rejected with 409
    expect(capacityExceededBookings.length).toBe(9);

    // CRITICAL ASSERTION: Database check - Available capacity must be EXACTLY 0, not negative!
    const finalEventState = await prisma.event.findUnique({
      where: { id: scarceEvent.id },
    });
    expect(finalEventState!.availableCapacity).toBe(0);

    // CRITICAL ASSERTION: Exactly 1 booking and 1 ticket exist in database for this event
    const totalBookings = await prisma.booking.count({
      where: { eventId: scarceEvent.id },
    });
    expect(totalBookings).toBe(1);

    const totalTickets = await prisma.ticket.count({
      where: { booking: { eventId: scarceEvent.id } },
    });
    expect(totalTickets).toBe(1);
  });
});
