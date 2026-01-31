'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function submitComment(formData: FormData) {
  const postId = formData.get('postId') as string;
  const nickname = formData.get('nickname') as string;
  const content = formData.get('content') as string;
  const slug = formData.get('slug') as string; // For revalidation

  if (!postId || !nickname || !content) {
    throw new Error('Missing required fields');
  }

  await db.comment.create({
    data: {
      postId,
      nickname,
      content,
      isApproved: false, // Pending moderation
    },
  });

  revalidatePath(`/blog/${slug}`);
}
