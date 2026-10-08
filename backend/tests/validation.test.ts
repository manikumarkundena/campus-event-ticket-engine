import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

describe('Gate Ticket Validation & Idempotency Suite', () => {
  let gateToken: string;
  let studentToken: string;
  let validTicketCode: string;
  let alreadyUsedTicketCode: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Login gate staff
    const gateLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'gate@sit.ac.in', password: 'Password123!' });
    gateToken = gateLogin.body.data.token;

    // Login student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@sit.ac.in', password: 'Password123!' });
    studentToken = studentLogin.body.data.token;

    // Find seeded valid ticket (student1)
    const validTkt = await prisma.ticket.findFirst({
      where: { status: 'VALID' },
    });
    validTicketCode = validTkt!.ticketCode;

    // Find seeded used ticket (student2)
    const usedTkt = await prisma.ticket.findFirst({
      where: { status: 'USED' },
    });
    alreadyUsedTicketCode = usedTkt!.ticketCode;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/validation/verify on VALID ticket grants entry and updates status to USED', async () => {
    const res = await request(app)
      .post('/api/validation/verify')
      .set('Authorization', `Bearer ${gateToken}`)
      .send({ ticketIdentifier: validTicketCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.result).toBe('VALID');
    expect(res.body.data.attendee.name).toBeDefined();

    // Verify status in DB updated to USED
    const ticketInDb = await prisma.ticket.findUnique({
      where: { ticketCode: validTicketCode },
    });
    expect(ticketInDb!.status).toBe('USED');
    expect(ticketInDb!.validatedAt).toBeDefined();
  });

  it('POST /api/validation/verify on previously validated ticket returns ALREADY_USED', async () => {
    // Attempt validating the same ticket again
    const res = await request(app)
      .post('/api/validation/verify')
      .set('Authorization', `Bearer ${gateToken}`)
      .send({ ticketIdentifier: validTicketCode });

    expect(res.status).toBe(200);
    expect(res.body.data.result).toBe('ALREADY_USED');
    expect(res.body.data.message).toContain('Duplicate entry blocked');
  });

  it('POST /api/validation/verify on non-existent ticket identifier returns INVALID', async () => {
    const res = await request(app)
      .post('/api/validation/verify')
      .set('Authorization', `Bearer ${gateToken}`)
      .send({ ticketIdentifier: 'TKT-FAKE-CODE-9999' });

    expect(res.status).toBe(200);
    expect(res.body.data.result).toBe('INVALID');
    expect(res.body.data.message).toContain('Ticket not found');
  });

  it('POST /api/validation/verify as STUDENT must return 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/validation/verify')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ ticketIdentifier: alreadyUsedTicketCode });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
