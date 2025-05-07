import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import Bid from '../models/bid.model.js';
import { connectToMongoDB, closeMongoDBConnection } from '../../../../shared/db-connection/mongodb.js';

// Load environment variables
dotenv.config();

// Function to get projects from Projects Service
const getProjects = async (count = 20) => {
  try {
    // In a real implementation, we would call the Projects Service API
    // For now, we'll generate fake project IDs
    return Array.from({ length: count }, () => 
      new mongoose.Types.ObjectId()
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

// Function to get freelancers from Auth Service
const getFreelancers = async (count = 20) => {
  try {
    // In a real implementation, we would call the Auth Service API
    // For now, we'll generate fake user IDs
    return Array.from({ length: count }, () => 
      new mongoose.Types.ObjectId()
    );
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    return [];
  }
};

// Function to generate a random bid
const generateBid = (projectId, freelancerId) => {
  const amount = faker.number.int({ min: 1000, max: 50000 });
  const deliveryTime = faker.number.int({ min: 1, max: 30 });
  const deliveryTimeUnit = faker.helpers.arrayElement(['days', 'weeks', 'months']);
  const status = faker.helpers.arrayElement(['pending', 'accepted', 'rejected', 'withdrawn', 'countered']);
  
  const bid = {
    projectId,
    freelancerId,
    amount,
    deliveryTime,
    deliveryTimeUnit,
    proposal: faker.lorem.paragraphs({ min: 1, max: 3 }),
    status,
    isActive: true,
    createdAt: faker.date.past({ years: 1 })
  };
  
  // Add attachments (30% chance)
  if (faker.helpers.maybe(() => true, { probability: 0.3 })) {
    bid.attachments = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      name: `${faker.word.sample()}.${faker.helpers.arrayElement(['pdf', 'doc', 'jpg', 'png'])}`,
      url: faker.image.url(),
      type: faker.helpers.arrayElement(['document', 'image'])
    }));
  }
  
  // Add milestones (50% chance)
  if (faker.helpers.maybe(() => true, { probability: 0.5 })) {
    const milestoneCount = faker.number.int({ min: 1, max: 5 });
    const milestoneAmount = Math.floor(amount / milestoneCount);
    
    bid.milestones = Array.from({ length: milestoneCount }, (_, index) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (index + 1) * 7);
      
      return {
        title: `Milestone ${index + 1}: ${faker.lorem.words({ min: 2, max: 5 })}`,
        description: faker.lorem.sentence(),
        amount: milestoneAmount,
        dueDate,
        status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed', 'approved'])
      };
    });
  }
  
  // Add counter offers (20% chance)
  if (status === 'countered' || faker.helpers.maybe(() => true, { probability: 0.2 })) {
    bid.counterOffers = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      amount: faker.number.int({ min: 1000, max: 50000 }),
      deliveryTime: faker.number.int({ min: 1, max: 30 }),
      deliveryTimeUnit: faker.helpers.arrayElement(['days', 'weeks', 'months']),
      message: faker.lorem.paragraph(),
      createdBy: faker.helpers.arrayElement([freelancerId, new mongoose.Types.ObjectId()]), // Either freelancer or client
      createdAt: faker.date.recent({ days: 30 })
    }));
  }
  
  // Add timestamps for status changes
  if (status === 'accepted') {
    bid.acceptedAt = faker.date.recent({ days: 30 });
  } else if (status === 'rejected') {
    bid.rejectedAt = faker.date.recent({ days: 30 });
  } else if (status === 'withdrawn') {
    bid.withdrawnAt = faker.date.recent({ days: 30 });
  }
  
  // Add feedback for completed projects (30% chance)
  if (status === 'accepted' && faker.helpers.maybe(() => true, { probability: 0.3 })) {
    // Client feedback
    bid.clientFeedback = {
      rating: faker.number.int({ min: 1, max: 5 }),
      comment: faker.lorem.paragraph(),
      createdAt: faker.date.recent({ days: 14 })
    };
    
    // Freelancer feedback (70% chance if client feedback exists)
    if (faker.helpers.maybe(() => true, { probability: 0.7 })) {
      bid.freelancerFeedback = {
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.paragraph(),
        createdAt: faker.date.recent({ days: 7 })
      };
    }
  }
  
  return bid;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing bids
    await Bid.deleteMany({});
    console.log('Cleared existing bids');
    
    // Get projects and freelancers
    const projects = await getProjects(20);
    const freelancers = await getFreelancers(20);
    
    console.log(`Got ${projects.length} projects and ${freelancers.length} freelancers`);
    
    // Generate bids
    const bidPromises = [];
    
    // Each project gets 5-10 bids from different freelancers
    for (const projectId of projects) {
      // Shuffle freelancers to get random ones for each project
      const shuffledFreelancers = [...freelancers].sort(() => 0.5 - Math.random());
      const bidCount = faker.number.int({ min: 5, max: 10 });
      
      for (let i = 0; i < bidCount && i < shuffledFreelancers.length; i++) {
        bidPromises.push(
          new Bid(generateBid(projectId, shuffledFreelancers[i])).save()
        );
      }
    }
    
    // Save all bids
    await Promise.all(bidPromises);
    
    console.log(`Successfully seeded ${bidPromises.length} bids`);
    
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
