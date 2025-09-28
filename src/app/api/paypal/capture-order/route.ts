import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';
import { sendEmail } from '@/lib/mail';
import { products } from '@/lib/products';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const captureData = await captureOrder(orderID);

    // If capture is successful, send a confirmation email
    if (captureData.status === 'COMPLETED') {
        const payerEmail = captureData.payer.email_address;
        const payerName = captureData.payer.name.given_name;

        // Extract purchased items and find their download links
        const purchasedItems = captureData.purchase_units[0].items;
        let downloadLinksHtml = '';

        for (const item of purchasedItems) {
            const product = products.find(p => p.name === item.name);
            if (product) {
                downloadLinksHtml += `<li><a href="${product.downloadUrl}">${product.name}</a></li>`;
            }
        }
        
        const emailHtml = `
            <h1>Thank You for Your Order, ${payerName}!</h1>
            <p>Your payment has been successfully processed.</p>
            <p>You can download your purchased digital goods here:</p>
            <ul>
                ${downloadLinksHtml}
            </ul>
            <p>If you have any questions, please contact us at hello@cuddleia.com.</p>
            <p>With love,<br>The Cuddleia Team</p>
        `;

        try {
            await sendEmail({
                to: payerEmail,
                subject: 'Your Cuddleia Order Confirmation & Downloads',
                html: emailHtml,
            });
        } catch (emailError) {
             console.error("Payment was successful, but failed to send confirmation email:", emailError);
            // Don't fail the entire request, just log the error. The payment is already processed.
        }
    }

    return NextResponse.json(captureData);

  } catch (error) {
    console.error("Error in capture-order route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to capture order.", details: errorMessage }, { status: 500 });
  }
}
