import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

interface ContactFormData {
  name: string
  email: string
  organisation: string
  heardFrom: string
  message?: string
}

const MAX_MESSAGE_LENGTH = 500

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, organisation, heardFrom, message } = (await req.json()) as ContactFormData

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 })
    }
    if (!organisation || !organisation.trim()) {
      return NextResponse.json({ success: false, message: 'Organisation is required' }, { status: 400 })
    }
    if (!heardFrom || !heardFrom.trim()) {
      return NextResponse.json({ success: false, message: 'Please tell us how you heard about us' }, { status: 400 })
    }

    // Validate message length
    if (message && message.trim().length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()
    const collection = db.collection('contacts')

    // Check for duplicate email
    const normalizedEmail = email.trim().toLowerCase()
    const existingContact = await collection.findOne({ email: normalizedEmail })

    if (existingContact) {
      return NextResponse.json(
        { success: false, message: 'This email has already been submitted. We will be in touch soon!' },
        { status: 409 }
      )
    }

    // Insert document
    await collection.insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      organisation: organisation.trim(),
      heardFrom: heardFrom.trim(),
      message: message?.trim() || null,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit form. Please try again.' },
      { status: 500 }
    )
  }
}
