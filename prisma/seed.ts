import { ContentType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const contentSeed = [
  {
    id: 'a6c09c90-76ec-47f8-bb8f-cdc9a55e0001',
    title: 'Understanding your cycle',
    description: 'A foundational guide to cycle phases and what to expect across a typical month.',
    type: ContentType.ARTICLE,
    is_premium: false,
    is_published: true,
    thumbnail_url: 'https://images.vye.app/content/cycle-basics.jpg',
    media_url: 'articles/cycle-basics.html',
    duration_seconds: 300,
    published_at: new Date('2026-03-18T00:00:00.000Z'),
  },
  {
    id: 'a6c09c90-76ec-47f8-bb8f-cdc9a55e0002',
    title: 'Hormones and energy patterns',
    description: 'A premium lesson on how energy shifts through the cycle and how to adapt routines.',
    type: ContentType.VIDEO,
    is_premium: true,
    is_published: true,
    thumbnail_url: 'https://images.vye.app/content/hormones-energy.jpg',
    media_url: 'videos/hormones-energy.mp4',
    duration_seconds: 780,
    published_at: new Date('2026-03-18T00:00:00.000Z'),
  },
  {
    id: 'a6c09c90-76ec-47f8-bb8f-cdc9a55e0003',
    title: 'Cramp relief audio reset',
    description: 'A short premium audio session focused on relaxation and symptom support.',
    type: ContentType.AUDIO,
    is_premium: true,
    is_published: true,
    thumbnail_url: 'https://images.vye.app/content/cramp-relief-audio.jpg',
    media_url: 'audio/cramp-relief.mp3',
    duration_seconds: 420,
    published_at: new Date('2026-03-18T00:00:00.000Z'),
  },
];

async function main() {
  for (const item of contentSeed) {
    await prisma.content.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        description: item.description,
        type: item.type,
        is_premium: item.is_premium,
        is_published: item.is_published,
        thumbnail_url: item.thumbnail_url,
        media_url: item.media_url,
        duration_seconds: item.duration_seconds,
        published_at: item.published_at,
      },
      create: item,
    });
  }

  console.log(`Seeded ${contentSeed.length} content records`);
}

void main()
  .catch(error => {
    console.error('Failed to seed content', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
