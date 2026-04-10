import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default achievement definitions to seed
 */
const achievements = [
  // Distance achievements
  {
    slug: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first activity',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 25,
    requirement: JSON.stringify({ type: 'activities', value: 1 }),
    sortOrder: 1,
  },
  {
    slug: 'distance-10k',
    name: '10K Club',
    description: 'Log 10 kilometers total',
    category: 'distance',
    tier: 'bronze',
    xpReward: 50,
    requirement: JSON.stringify({ type: 'distance', value: 10000 }),
    sortOrder: 10,
  },
  {
    slug: 'distance-100k',
    name: 'Century Runner',
    description: 'Log 100 kilometers total',
    category: 'distance',
    tier: 'silver',
    xpReward: 150,
    requirement: JSON.stringify({ type: 'distance', value: 100000 }),
    sortOrder: 11,
  },
  {
    slug: 'distance-500k',
    name: 'Half Thousand',
    description: 'Log 500 kilometers total',
    category: 'distance',
    tier: 'gold',
    xpReward: 400,
    requirement: JSON.stringify({ type: 'distance', value: 500000 }),
    sortOrder: 12,
  },
  {
    slug: 'distance-1000k',
    name: 'Thousand Mile Club',
    description: 'Log 1,000 kilometers total',
    category: 'distance',
    tier: 'platinum',
    xpReward: 1000,
    requirement: JSON.stringify({ type: 'distance', value: 1000000 }),
    sortOrder: 13,
  },

  // Streak achievements
  {
    slug: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    tier: 'bronze',
    xpReward: 75,
    requirement: JSON.stringify({ type: 'streak', value: 7 }),
    sortOrder: 20,
  },
  {
    slug: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    tier: 'silver',
    xpReward: 250,
    requirement: JSON.stringify({ type: 'streak', value: 30 }),
    sortOrder: 21,
  },
  {
    slug: 'streak-100',
    name: 'Century Streak',
    description: 'Maintain a 100-day streak',
    category: 'streak',
    tier: 'gold',
    xpReward: 750,
    requirement: JSON.stringify({ type: 'streak', value: 100 }),
    sortOrder: 22,
  },
  {
    slug: 'streak-365',
    name: 'Year of Dedication',
    description: 'Maintain a 365-day streak',
    category: 'streak',
    tier: 'platinum',
    xpReward: 2500,
    requirement: JSON.stringify({ type: 'streak', value: 365 }),
    sortOrder: 23,
  },

  // Consistency achievements
  {
    slug: 'consistent-week',
    name: 'Consistent Week',
    description: 'Complete 4+ activities in a week',
    category: 'consistency',
    tier: 'bronze',
    xpReward: 50,
    requirement: JSON.stringify({ type: 'activities', value: 4, timeframeDays: 7 }),
    sortOrder: 30,
  },
  {
    slug: 'consistent-month',
    name: 'Monthly Momentum',
    description: 'Complete 16+ activities in a month',
    category: 'consistency',
    tier: 'silver',
    xpReward: 200,
    requirement: JSON.stringify({ type: 'activities', value: 16, timeframeDays: 30 }),
    sortOrder: 31,
  },

  // Milestone achievements
  {
    slug: 'activities-10',
    name: 'Getting Started',
    description: 'Complete 10 activities',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 50,
    requirement: JSON.stringify({ type: 'activities', value: 10 }),
    sortOrder: 40,
  },
  {
    slug: 'activities-50',
    name: 'Dedicated Athlete',
    description: 'Complete 50 activities',
    category: 'milestone',
    tier: 'silver',
    xpReward: 150,
    requirement: JSON.stringify({ type: 'activities', value: 50 }),
    sortOrder: 41,
  },
  {
    slug: 'activities-100',
    name: 'Century Club',
    description: 'Complete 100 activities',
    category: 'milestone',
    tier: 'gold',
    xpReward: 350,
    requirement: JSON.stringify({ type: 'activities', value: 100 }),
    sortOrder: 42,
  },
  {
    slug: 'activities-500',
    name: 'Legendary Athlete',
    description: 'Complete 500 activities',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 1500,
    requirement: JSON.stringify({ type: 'activities', value: 500 }),
    sortOrder: 43,
  },

  // Level achievements
  {
    slug: 'level-10',
    name: 'Double Digits',
    description: 'Reach level 10',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 100,
    requirement: JSON.stringify({ type: 'level', value: 10 }),
    sortOrder: 50,
  },
  {
    slug: 'level-25',
    name: 'Quarter Century',
    description: 'Reach level 25',
    category: 'milestone',
    tier: 'silver',
    xpReward: 250,
    requirement: JSON.stringify({ type: 'level', value: 25 }),
    sortOrder: 51,
  },
  {
    slug: 'level-50',
    name: 'Half Way There',
    description: 'Reach level 50',
    category: 'milestone',
    tier: 'gold',
    xpReward: 500,
    requirement: JSON.stringify({ type: 'level', value: 50 }),
    sortOrder: 52,
  },
  {
    slug: 'level-100',
    name: 'Centurion',
    description: 'Reach level 100',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 2000,
    requirement: JSON.stringify({ type: 'level', value: 100 }),
    sortOrder: 53,
  },

  // Special achievements
  {
    slug: 'tss-100',
    name: 'Century Load',
    description: 'Complete an activity with 100+ TSS',
    category: 'special',
    tier: 'gold',
    xpReward: 200,
    requirement: JSON.stringify({ type: 'tss', value: 100 }),
    sortOrder: 60,
  },
  {
    slug: 'hour-plus',
    name: 'Hour Power',
    description: 'Complete an activity over 1 hour',
    category: 'special',
    tier: 'bronze',
    xpReward: 50,
    requirement: JSON.stringify({ type: 'duration', value: 3600 }),
    sortOrder: 61,
  },
  {
    slug: 'two-hours',
    name: 'Endurance King',
    description: 'Complete an activity over 2 hours',
    category: 'special',
    tier: 'silver',
    xpReward: 150,
    requirement: JSON.stringify({ type: 'duration', value: 7200 }),
    sortOrder: 62,
  },
];

async function main() {
  console.log('Seeding achievements...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
