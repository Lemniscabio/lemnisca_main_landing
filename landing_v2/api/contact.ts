import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';

interface ContactFormData {
  name: string;
  email: string;
  organisation: string;
  heardFrom: string;
  message?: string;
}

const MAX_MESSAGE_LENGTH = 500;

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, organisation, heardFrom, message } = req.body as ContactFormData;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!organisation || !organisation.trim()) {
      return res.status(400).json({ success: false, message: 'Organisation is required' });
    }
    if (!heardFrom || !heardFrom.trim()) {
      return res.status(400).json({ success: false, message: 'Please tell us how you heard about us' });
    }

    // Validate message length
    if (message && message.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        success: false, 
        message: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` 
      });
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('contacts');

    // Check for duplicate email
    const normalizedEmail = email.trim().toLowerCase();
    const existingContact = await collection.findOne({ email: normalizedEmail });
    
    if (existingContact) {
      return res.status(409).json({ 
        success: false, 
        message: 'This email has already been submitted. We will be in touch soon!' 
      });
    }

    // Insert document
    await collection.insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      organisation: organisation.trim(),
      heardFrom: heardFrom.trim(),
      message: message?.trim() || null,
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit form. Please try again.' });
  }
}
