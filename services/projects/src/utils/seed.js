import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import Project from '../models/project.model.js';
import Category from '../models/category.model.js';
import { connectToMongoDB, closeMongoDBConnection } from '../../../../shared/db-connection/mongodb.js';

// Load environment variables
dotenv.config();

// Function to get random users from Auth Service
const getRandomUsers = async (role, count) => {
  try {
    // In a real implementation, we would call the Auth Service API
    // For now, we'll generate fake user IDs
    return Array.from({ length: count }, () => 
      new mongoose.Types.ObjectId()
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Function to generate a random project
const generateProject = (clientId, categories) => {
  const category = faker.helpers.arrayElement(categories);
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + faker.number.int({ min: 7, max: 90 }));
  
  const duration = faker.number.int({ min: 1, max: 30 });
  const durationType = faker.helpers.arrayElement(['days', 'weeks', 'months']);
  
  return {
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.lorem.paragraphs({ min: 2, max: 5 }),
    requirements: faker.lorem.paragraphs({ min: 1, max: 3 }),
    clientId,
    budget: faker.number.int({ min: 500, max: 50000 }),
    deadline: futureDate,
    category: category.name,
    skills: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => 
      faker.helpers.arrayElement([
        'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 
        'HTML', 'CSS', 'Tailwind CSS', 'TypeScript', 'Python',
        'Django', 'Flask', 'PHP', 'Laravel', 'WordPress',
        'UI Design', 'UX Design', 'Graphic Design', 'Logo Design',
        'Content Writing', 'Copywriting', 'SEO', 'Digital Marketing'
      ])
    ),
    status: faker.helpers.arrayElement(['open', 'in-progress', 'completed', 'cancelled']),
    location: faker.helpers.arrayElement(['remote', 'on-site', 'hybrid']),
    duration,
    durationType,
    visibility: faker.helpers.arrayElement(['public', 'private', 'invite-only']),
    views: faker.number.int({ min: 0, max: 500 }),
    bidCount: faker.number.int({ min: 0, max: 20 }),
    createdAt: faker.date.past({ years: 1 })
  };
};

// Function to generate categories
const generateCategories = () => {
  const categories = [
    {
      name: 'Web Development',
      description: 'Web development services including frontend and backend',
      icon: 'web',
      order: 1
    },
    {
      name: 'Mobile Development',
      description: 'Mobile app development for iOS and Android',
      icon: 'mobile',
      order: 2
    },
    {
      name: 'UI/UX Design',
      description: 'User interface and user experience design',
      icon: 'design',
      order: 3
    },
    {
      name: 'Graphic Design',
      description: 'Graphic design services including logos, banners, etc.',
      icon: 'graphic',
      order: 4
    },
    {
      name: 'Content Writing',
      description: 'Content writing services including articles, blogs, etc.',
      icon: 'content',
      order: 5
    },
    {
      name: 'Digital Marketing',
      description: 'Digital marketing services including SEO, SEM, etc.',
      icon: 'marketing',
      order: 6
    },
    {
      name: 'SEO',
      description: 'Search engine optimization services',
      icon: 'seo',
      order: 7
    },
    {
      name: 'Data Entry',
      description: 'Data entry services',
      icon: 'data',
      order: 8
    },
    {
      name: 'Virtual Assistant',
      description: 'Virtual assistant services',
      icon: 'assistant',
      order: 9
    },
    {
      name: 'Translation',
      description: 'Translation services',
      icon: 'translation',
      order: 10
    },
    {
      name: 'Video Editing',
      description: 'Video editing services',
      icon: 'video',
      order: 11
    },
    {
      name: 'Animation',
      description: 'Animation services',
      icon: 'animation',
      order: 12
    },
    {
      name: 'Voice Over',
      description: 'Voice over services',
      icon: 'voice',
      order: 13
    },
    {
      name: 'Music Production',
      description: 'Music production services',
      icon: 'music',
      order: 14
    },
    {
      name: 'Photography',
      description: 'Photography services',
      icon: 'photo',
      order: 15
    },
    {
      name: 'Illustration',
      description: 'Illustration services',
      icon: 'illustration',
      order: 16
    },
    {
      name: 'Logo Design',
      description: 'Logo design services',
      icon: 'logo',
      order: 17
    },
    {
      name: 'Copywriting',
      description: 'Copywriting services',
      icon: 'copy',
      order: 18
    },
    {
      name: 'Other',
      description: 'Other services',
      icon: 'other',
      order: 19
    }
  ];
  
  return categories;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Category.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing data');
    
    // Create categories
    const categoryData = generateCategories();
    const categories = await Category.insertMany(categoryData);
    console.log(`Created ${categories.length} categories`);
    
    // Get random client IDs
    const clientIds = await getRandomUsers('client', 20);
    console.log(`Got ${clientIds.length} client IDs`);
    
    // Generate projects
    const projectPromises = [];
    
    // Each client creates 5 projects
    for (const clientId of clientIds) {
      for (let i = 0; i < 5; i++) {
        projectPromises.push(
          new Project(generateProject(clientId, categories)).save()
        );
      }
    }
    
    // Save all projects
    await Promise.all(projectPromises);
    
    console.log(`Successfully seeded ${projectPromises.length} projects`);
    
    // Close the connection
    await closeMongoDBConnection();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
