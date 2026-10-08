import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

describe('Event Lifecycle & RBAC Suite', () => {
  let organizerToken: string;
  let studentToken: string;
  let testEventId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Login as organizer
    const orgLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'organizer@sit.ac.in', password: 'Password123!' });
    organizerToken = orgLogin.body.data.token;

    // Login as student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@sit.ac.in', password: 'Password123!' });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/events should return public published events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/events as ORGANIZER should create a new event', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'IEEE SIT Autonomous Agent Summit 2026',
        description: 'Comprehensive symposium on modern AI agent architectures and orchestration.',
        category: 'TECHNICAL',
        venue: 'Media Center Audi 2, SIT',
        startDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 4 * 3600000).toISOString(),
        totalCapacity: 75,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('IEEE SIT Autonomous Agent Summit 2026');
    expect(res.body.data.availableCapacity).toBe(75);
    testEventId = res.body.data.id;
  });

  it('POST /api/events as STUDENT should be rejected with 403 Forbidden', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Student Event',
        description: 'Attempting to create event without organizer permission.',
        category: 'TECHNICAL',
        venue: 'Campus Quadrangle',
        startDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        totalCapacity: 50,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/events/:id as ORGANIZER should update event details', async () => {
    const res = await request(app)
      .put(`/api/events/${testEventId}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        venue: 'Birla Auditorium, SIT Main Block',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.venue).toBe('Birla Auditorium, SIT Main Block');
  });

  it('GET /api/events/organizer/dashboard should return real database analytics', async () => {
    const res = await request(app)
      .get('/api/events/organizer/dashboard')
      .set('Authorization', `Bearer ${organizerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.totalEvents).toBe('number');
    expect(typeof res.body.data.totalCapacity).toBe('number');
    expect(typeof res.body.data.totalBookings).toBe('number');
  });
});
