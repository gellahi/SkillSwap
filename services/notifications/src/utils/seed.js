import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Notification from '../models/notification.model.js';
import NotificationPreference from '../models/notification-preference.model.js';
import { connectToMongoDB, closeMongoDBConnection } from '../../../../shared/db-connection/mongodb.js';

// Load environment variables
dotenv.config();

// Function to get users from Auth Service
const getUsers = async (count = 20) => {
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

// Function to generate a random notification
const generateNotification = (userId, index) => {
  const types = [
    'project', 'bid', 'message', 'payment', 'review', 
    'milestone', 'system', 'counter-offer', 'bid-accepted', 
    'bid-rejected', 'conversation', 'feedback', 'other'
  ];
  
  const type = faker.helpers.arrayElement(types);
  
  // Generate title and message based on type
  let title, message;
  
  switch (type) {
    case 'project':
      title = 'New Project Posted';
      message = `A new project matching your skills has been posted: ${faker.lorem.sentence()}`;
      break;
    case 'bid':
      title = 'New Bid Received';
      message = 'You have received a new bid on your project';
      break;
    case 'message':
      title = 'New Message';
      message = `You have a new message from ${faker.person.fullName()}`;
      break;
    case 'payment':
      title = 'Payment Received';
      message = `You have received a payment of ${faker.finance.amount(100, 5000, 2)} PKR`;
      break;
    case 'review':
      title = 'New Review';
      message = 'You have received a new review';
      break;
    case 'milestone':
      title = 'Milestone Completed';
      message = 'A milestone has been marked as completed';
      break;
    case 'system':
      title = 'System Notification';
      message = 'Your account has been verified successfully';
      break;
    case 'counter-offer':
      title = 'Counter Offer Received';
      message = 'You have received a counter offer on your bid';
      break;
    case 'bid-accepted':
      title = 'Bid Accepted';
      message = 'Your bid has been accepted!';
      break;
    case 'bid-rejected':
      title = 'Bid Rejected';
      message = 'Your bid has been rejected';
      break;
    case 'conversation':
      title = 'New Conversation';
      message = 'You have been added to a new conversation';
      break;
    case 'feedback':
      title = 'Feedback Received';
      message = 'You have received feedback on your work';
      break;
    default:
      title = 'Notification';
      message = faker.lorem.sentence();
  }
  
  // Generate random data
  const data = {};
  
  if (type === 'project') {
    data.projectId = new mongoose.Types.ObjectId();
  } else if (type === 'bid' || type === 'counter-offer' || type === 'bid-accepted' || type === 'bid-rejected') {
    data.projectId = new mongoose.Types.ObjectId();
    data.bidId = new mongoose.Types.ObjectId();
  } else if (type === 'message' || type === 'conversation') {
    data.conversationId = new mongoose.Types.ObjectId();
    if (type === 'message') {
      data.messageId = new mongoose.Types.ObjectId();
    }
  } else if (type === 'payment') {
    data.paymentId = new mongoose.Types.ObjectId();
    data.amount = faker.finance.amount(100, 5000, 2);
  } else if (type === 'review' || type === 'feedback') {
    data.projectId = new mongoose.Types.ObjectId();
    data.rating = faker.number.int({ min: 1, max: 5 });
  } else if (type === 'milestone') {
    data.projectId = new mongoose.Types.ObjectId();
    data.milestoneId = new mongoose.Types.ObjectId();
  }
  
  // Determine if notification is read (older notifications more likely to be read)
  const isRead = index < 5 ? false : faker.helpers.maybe(() => true, { probability: 0.7 });
  
  // Create notification
  return {
    userId,
    title,
    message,
    type,
    isRead,
    readAt: isRead ? faker.date.recent({ days: 7 }) : null,
    data,
    channel: 'in-app',
    status: 'sent',
    sentAt: faker.date.recent({ days: 30 }),
    priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
    createdAt: faker.date.recent({ days: 30 })
  };
};

// Function to generate notification preferences
const generatePreference = (userId) => {
  return {
    userId,
    email: {
      enabled: faker.helpers.maybe(() => true, { probability: 0.8 }),
      frequency: faker.helpers.arrayElement(['immediate', 'daily', 'weekly', 'never'])
    },
    sms: {
      enabled: faker.helpers.maybe(() => true, { probability: 0.3 }),
      frequency: faker.helpers.arrayElement(['immediate', 'daily', 'never'])
    },
    inApp: {
      enabled: true
    },
    push: {
      enabled: faker.helpers.maybe(() => true, { probability: 0.5 })
    },
    doNotDisturb: {
      enabled: faker.helpers.maybe(() => true, { probability: 0.4 }),
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Asia/Karachi'
    }
  };
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Notification.deleteMany({});
    await NotificationPreference.deleteMany({});
    console.log('Cleared existing data');
    
    // Get users
    const users = await getUsers(20);
    console.log(`Got ${users.length} users`);
    
    // Generate notifications and preferences
    const notificationPromises = [];
    const preferencePromises = [];
    
    // Generate 10-30 notifications per user
    for (const userId of users) {
      const notificationCount = faker.number.int({ min: 10, max: 30 });
      
      for (let i = 0; i < notificationCount; i++) {
        notificationPromises.push(
          new Notification(generateNotification(userId, i)).save()
        );
      }
      
      // Generate preferences for each user
      preferencePromises.push(
        new NotificationPreference(generatePreference(userId)).save()
      );
    }
    
    // Save all notifications and preferences
    await Promise.all([...notificationPromises, ...preferencePromises]);
    
    console.log(`Successfully seeded ${notificationPromises.length} notifications and ${preferencePromises.length} preferences`);
    
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
