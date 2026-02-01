'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from './db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function register(formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { username, password } = validatedFields.data;

  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: 'Username already taken' };
  }

  // Create user
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  return { success: 'User created successfully!' };
}

// Custom login action that doesn't redirect immediately
export async function login(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    console.log(`[Action] Manual verification for: ${username}`);

    // 1. Manual User Lookup
    const user = await db.user.findUnique({ where: { username } });
    
    if (!user) {
      console.log(`[Action] User not found: ${username}`);
      return { error: '该用户未注册，请先注册' };
    }

    // 2. Manual Password Check
    const passwordsMatch = await bcrypt.compare(password, user.password);
    console.log(`[Action] Password check: ${passwordsMatch}`);

    if (!passwordsMatch) {
      return { error: '用户名或密码错误' };
    }

    // 3. If passed, invoke NextAuth to create session
    // We already verified the credentials, so this call is just for session creation.
    await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    console.error('[Action] SignIn error caught:', error);
    
    // Even if signIn throws (which it shouldn't if we verified credentials, unless system error),
    // we handle it here.
    if (error instanceof AuthError) {
       switch (error.type) {
        case 'CredentialsSignin':
          return { error: '用户名或密码错误' }; // Should not happen if manual check passed
        default:
          return { error: '登录失败，请稍后重试' };
      }
    }
    throw error;
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
