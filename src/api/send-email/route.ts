
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// This API route now simulates a manual order fulfillment process.
// It sends an email to an internal address, notifying the admin that a new order
// has been paid and requires manual fulfillment of download links.

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, cart, subtotal, paymentId } = await request.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    const productList = cart.map((item: any) => `
      <li>
        ${item.name} (x${item.quantity}) - ${item.downloadUrl}
      </li>
    `).join('');
    
    // Email to the administrator for fulfillment
    const adminMailOptions = {
      from: `"Cuddleia System" <${process.env.ZOHO_EMAIL}>`,
      to: `admin@cuddleia.com`, // Internal admin email
      subject: `[ACTION REQUIRED] New Paid Order - ${customerName}`,
      html: `
        <div style="font-family: sans-serif;">
          <h1>New Paid Order</h1>
          <p>A new order has been marked as paid and requires manual fulfillment.</p>
          
          <h2>Customer Details:</h2>
          <ul>
            <li><strong>Name:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
          </ul>

          <h2>Order Details:</h2>
          <ul>
            ${productList}
          </ul>
          <p><strong>Total:</strong> ${subtotal}</p>
          <p><strong>Payment ID:</strong> ${paymentId || 'N/A'}</p>

          <p>Please send the download links to the customer's email address listed above.</p>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ message: 'Admin notification sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return NextResponse.json({ message: 'Failed to send admin notification' }, { status: 500 });
  }
}

    