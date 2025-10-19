
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const zohoUser = process.env.ZOHO_MAIL_USER;
    const zohoPass = process.env.ZOHO_MAIL_APP_PASSWORD;

    if (!zohoUser || !zohoPass) {
        console.error('Zoho Mail credentials are not set in environment variables.');
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: zohoUser,
        pass: zohoPass,
      },
    });

    // Set up email data
    const mailOptions = {
      from: `"Cuddleia Contact Form" <${zohoUser}>`, // Sender address
      to: zohoUser, // List of receivers (send to yourself)
      replyTo: email, // Reply-to the user who submitted the form
      subject: `New Contact Form Submission: ${subject}`, // Subject line
      html: `
        <h2>New message from your website's contact form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
