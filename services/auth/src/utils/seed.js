import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import User from '../models/user.model.js';
import { connectToMongoDB, closeMongoDBConnection } from '../../../../shared/db-connection/mongodb.js';

// Load environment variables
dotenv.config();

// Function to generate a random user
const generateUser = (role) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const gender = faker.person.sex();
  
  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: 'Password123!', // Default password for all seed users
    role,
    isVerified: true, // All seed users are verified
    phoneNumber: faker.phone.number('+92##########'),
    profilePicture: faker.image.avatar(),
    bio: faker.person.bio(),
    skills: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => 
      faker.helpers.arrayElement([
        'Web Development', 'Mobile Development', 'UI/UX Design', 
        'Graphic Design', 'Content Writing', 'Digital Marketing',
        'SEO', 'Data Entry', 'Virtual Assistant', 'Translation',
        'Video Editing', 'Animation', 'Voice Over', 'Music Production',
        'Photography', 'Illustration', 'Logo Design', 'Copywriting'
      ])
    ),
    location: {
      country: 'Pakistan',
      city: faker.helpers.arrayElement([
        'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
        'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
      ])
    },
    socialLinks: {
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(5)}`,
      github: `https://github.com/${firstName.toLowerCase()}${faker.string.alphanumeric(3)}`,
      website: faker.helpers.maybe(() => `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com`, { probability: 0.3 })
    },
    lastLogin: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
    createdAt: faker.date.past({ years: 1 })
  };
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@skillswap.com',
      password: 'Admin123!',
      role: 'admin',
      isVerified: true,
      phoneNumber: '+923001234567',
      bio: 'SkillSwap platform administrator',
      location: {
        country: 'Pakistan',
        city: 'Islamabad'
      }
    });
    
    await adminUser.save();
    console.log('Admin user created');
    
    // Generate 50 clients
    const clientPromises = Array.from({ length: 50 }, () => 
      new User(generateUser('client')).save()
    );
    
    // Generate 50 freelancers
    const freelancerPromises = Array.from({ length: 50 }, () => 
      new User(generateUser('freelancer')).save()
    );
    
    // Save all users
    await Promise.all([...clientPromises, ...freelancerPromises]);
    
    console.log('Successfully seeded 50 clients and 50 freelancers');
    
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
