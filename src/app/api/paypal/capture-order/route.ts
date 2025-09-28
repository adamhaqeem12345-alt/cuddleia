import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';
import { sendEmail } from '@/lib/mail';
import { products } from '@/lib/products';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      console.error("Capture order failed: Order ID is required.");
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

        if (purchasedItems && purchasedItems.length > 0) {
            for (const item of purchasedItems) {
                // Find product by SKU, which we set to product.id during order creation
                const product = products.find(p => p.id === item.sku);
                if (product && product.downloadUrl) {
                    downloadLinksHtml += `<li><strong>${product.name}</strong>: <a href="${product.downloadUrl}">Download Here</a></li>`;
                } else {
                    downloadLinksHtml += `<li><strong>${item.name}</strong>: Download link not found.</li>`;
                }
            }
        }
        
        const emailHtml = `
            <div style="font-family: sans-serif; line-height: 1.6;">
                <h2>Thank You for Your Order, ${payerName}!</h2>
                <p>Your payment has been successfully processed. We're so excited to share our creations with you.</p>
                <p>You can download your purchased digital goods here:</p>
                <ul style="list-style-type: none; padding-left: 0;">
                    ${downloadLinksHtml || '<li>No downloadable items found. Please contact support.</li>'}
                </ul>
                <p>If you have any questions, please reply to this email or contact us at ${process.env.EMAIL_FROM}.</p>
                <p>With love,<br>The Cuddleia Team</p>
            </div>
        `;

        try {
            await sendEmail({
                to: payerEmail,
                subject: 'Your Cuddleia Order Confirmation & Downloads',
                html: emailHtml,
            });
        } catch (emailError) {
             // Do not fail the entire request, just log the error. The payment is already processed.
             console.error("Payment was successful, but failed to send confirmation email:", emailError);
        }
    }

    return NextResponse.json(captureData);

  } catch (error) {
    console.error("Error in capture-order route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to capture order.", details: errorMessage }, { status: 500 });
  }
}
