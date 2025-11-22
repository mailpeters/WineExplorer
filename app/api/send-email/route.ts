// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type EmailRequest = {
  to: string;
  subject?: string;
  message: string;
};

export async function POST(request: Request) {
  const { to, message, subject = 'Wine Explorer Notification' } = await request.json() as EmailRequest;

  // Validate input
  if (!to || !message) {
    return NextResponse.json(
      { error: 'Missing required fields: to or message' },
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"Wine Explorer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: sans-serif">
          <h2 style="color: #7e22ce">Wine Explorer Notification</h2>
          <p>${message}</p>
          <small>Sent at ${new Date().toLocaleString()}</small>
        </div>
      `
    });

    console.log('Email sent:', info.messageId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}