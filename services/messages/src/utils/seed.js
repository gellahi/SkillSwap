import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { connectToMongoDB, closeMongoDBConnection } from '../../../../shared/db-connection/mongodb.js';
import crypto from 'crypto';

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

// Function to get projects from Projects Service
const getProjects = async (count = 10) => {
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

// Function to generate a random conversation
const generateConversation = (participants, projectId = null, type = 'direct') => {
  const title = type === 'direct' ? null : faker.lorem.words({ min: 2, max: 5 });
  
  return {
    participants,
    projectId,
    title,
    type,
    isActive: true,
    metadata: {},
    createdAt: faker.date.past({ years: 1 })
  };
};

// Function to generate random messages for a conversation
const generateMessages = (conversationId, participants, count = 20) => {
  const messages = [];
  const now = new Date();
  
  // Generate messages over the past 30 days
  for (let i = 0; i < count; i++) {
    const sender = faker.helpers.arrayElement(participants);
    const createdAt = faker.date.between({ from: new Date(now - 30 * 24 * 60 * 60 * 1000), to: now });
    const text = faker.lorem.paragraph();
    
    // Generate hash for message integrity
    const hash = crypto
      .createHash('sha256')
      .update(`${sender}:${text}:${createdAt.getTime()}`)
      .digest('hex');
    
    // Create message
    const message = {
      conversationId,
      sender,
      text,
      createdAt,
      readBy: [
        {
          user: sender,
          timestamp: createdAt
        }
      ],
      metadata: {
        hash,
        encryptionType: 'none'
      },
      isDeleted: false
    };
    
    // 20% chance of having attachments
    if (faker.helpers.maybe(() => true, { probability: 0.2 })) {
      message.attachments = [{
        name: `${faker.word.sample()}.${faker.helpers.arrayElement(['pdf', 'doc', 'jpg', 'png'])}`,
        url: faker.image.url(),
        type: faker.helpers.arrayElement(['document', 'image']),
        size: faker.number.int({ min: 10000, max: 5000000 })
      }];
    }
    
    // 10% chance of being a reply to another message
    if (i > 0 && faker.helpers.maybe(() => true, { probability: 0.1 })) {
      message.replyTo = messages[faker.number.int({ min: 0, max: i - 1 })]._id;
    }
    
    // 5% chance of being edited
    if (faker.helpers.maybe(() => true, { probability: 0.05 })) {
      message.isEdited = true;
      message.editHistory = [{
        text: faker.lorem.paragraph(),
        timestamp: new Date(createdAt.getTime() - 1000 * 60 * 10) // 10 minutes before
      }];
    }
    
    // 3% chance of being deleted
    if (faker.helpers.maybe(() => true, { probability: 0.03 })) {
      message.isDeleted = true;
      message.text = 'This message has been deleted';
      message.deletedAt = new Date(createdAt.getTime() + 1000 * 60 * 30); // 30 minutes after
    }
    
    // Add read receipts for other participants (70% chance per participant)
    participants.forEach(participantId => {
      if (participantId.toString() !== sender.toString() && faker.helpers.maybe(() => true, { probability: 0.7 })) {
        message.readBy.push({
          user: participantId,
          timestamp: new Date(createdAt.getTime() + faker.number.int({ min: 60000, max: 3600000 })) // 1-60 minutes after
        });
      }
    });
    
    messages.push(message);
  }
  
  return messages;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared existing data');
    
    // Get users and projects
    const users = await getUsers(20);
    const projects = await getProjects(10);
    
    console.log(`Got ${users.length} users and ${projects.length} projects`);
    
    // Generate conversations and messages
    const conversations = [];
    const allMessages = [];
    
    // Generate direct conversations (1-on-1)
    for (let i = 0; i < 15; i++) {
      // Get two random users
      const user1 = users[faker.number.int({ min: 0, max: users.length - 1 })];
      let user2;
      do {
        user2 = users[faker.number.int({ min: 0, max: users.length - 1 })];
      } while (user1.toString() === user2.toString());
      
      const participants = [user1, user2];
      
      // Create conversation
      const conversation = new Conversation(generateConversation(participants));
      await conversation.save();
      conversations.push(conversation);
      
      // Generate messages for this conversation
      const messageCount = faker.number.int({ min: 5, max: 50 });
      const messages = generateMessages(conversation._id, participants, messageCount);
      
      // Save messages
      for (const messageData of messages) {
        const message = new Message(messageData);
        await message.save();
        allMessages.push(message);
      }
      
      // Update conversation with last message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        conversation.lastMessage = {
          text: lastMessage.text,
          sender: lastMessage.sender,
          timestamp: lastMessage.createdAt
        };
        await conversation.save();
      }
    }
    
    // Generate project conversations
    for (let i = 0; i < 10; i++) {
      // Get a random project
      const projectId = projects[i % projects.length];
      
      // Get 2-5 random users
      const participantCount = faker.number.int({ min: 2, max: 5 });
      const participants = [];
      
      while (participants.length < participantCount) {
        const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
        if (!participants.some(p => p.toString() === user.toString())) {
          participants.push(user);
        }
      }
      
      // Create conversation
      const conversation = new Conversation(generateConversation(participants, projectId, 'project'));
      await conversation.save();
      conversations.push(conversation);
      
      // Generate messages for this conversation
      const messageCount = faker.number.int({ min: 10, max: 100 });
      const messages = generateMessages(conversation._id, participants, messageCount);
      
      // Save messages
      for (const messageData of messages) {
        const message = new Message(messageData);
        await message.save();
        allMessages.push(message);
      }
      
      // Update conversation with last message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        conversation.lastMessage = {
          text: lastMessage.text,
          sender: lastMessage.sender,
          timestamp: lastMessage.createdAt
        };
        await conversation.save();
      }
    }
    
    console.log(`Successfully seeded ${conversations.length} conversations and ${allMessages.length} messages`);
    
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
