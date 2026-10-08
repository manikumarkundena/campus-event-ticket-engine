import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';

describe('Admin Operations & System Security Suite', () => {
  let adminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    await prisma.$connect();

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@sit.ac.in', password: 'Password123!' });
    adminToken = adminLogin.body.data.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@sit.ac.in', password: 'Password123!' });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/admin/users as ADMIN returns user list with roles', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/admin/users as STUDENT must be rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/admin/stats as ADMIN returns real database counts', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toBeGreaterThanOrEqual(4);
    expect(res.body.data.events).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.bookings).toBe('number');
  });

  it('GET /api/admin/audit as ADMIN returns audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/health should return UP status and component health without auth', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.components.database.status).toBe('healthy');
  });
});
