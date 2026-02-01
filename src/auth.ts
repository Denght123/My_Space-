import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function getUser(username: string) {
  try {
    const user = await db.user.findUnique({
      where: { username },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() }) // Removed .min(6) to ensure we verify logic, not schema
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          
          console.log(`[Auth] Attempting login for: ${username}`);
          
          const user = await getUser(username);
          if (!user) {
            console.log(`[Auth] User not found: ${username}`);
            throw new Error('UserNotRegistered');
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log(`[Auth] Password match result: ${passwordsMatch}`);
          
          if (passwordsMatch) {
            return user;
          } else {
            console.log('[Auth] Password mismatch');
            throw new Error('PasswordMismatch');
          }
        }
        
        console.log('[Auth] Invalid input format');
        return null;
      },
    }),
  ],
});
