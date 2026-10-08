import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, TokenPayload } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../utils/audit';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
  department?: string;
  usn?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export async function registerUser(data: RegisterDTO, ipAddress?: string) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  if (data.usn) {
    const existingUsn = await prisma.user.findUnique({
      where: { usn: data.usn.toUpperCase() },
    });
    if (existingUsn) {
      throw new AppError('An account with this USN already exists', 409);
    }
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: data.role || 'STUDENT',
      department: data.department || null,
      usn: data.usn ? data.usn.toUpperCase() : null,
    },
  });

  await logAudit({
    action: 'USER_REGISTER',
    entityType: 'USER',
    entityId: user.id,
    userId: user.id,
    metadata: { role: user.role, email: user.email },
    ipAddress,
  });

  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = signToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      usn: user.usn,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function loginUser(data: LoginDTO, ipAddress?: string) {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(data.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  await logAudit({
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    userId: user.id,
    metadata: { email: user.email, role: user.role },
    ipAddress,
  });

  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = signToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      usn: user.usn,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      usn: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          organizedEvents: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
