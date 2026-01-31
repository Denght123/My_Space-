'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const published = formData.get('published') === 'on';

  await db.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      published,
    },
  });

  revalidatePath('/dashboard/posts');
}
