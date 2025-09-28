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
    
    // Check if the payment was successfully completed
    if (captureData.status === 'COMPLETED') {
        const payerEmail = captureData.payer.email_address;
        const payerName = captureData.payer.name.given_name;

        // Extract purchased items from the captured order details
        const purchasedItems = captureData.purchase_units[0].items;
        let downloadLinksHtml = '';

        if (purchasedItems && purchasedItems.length > 0) {
            for (const item of purchasedItems) {
                // Find the corresponding product in our database to get the download URL
                const product = products.find(p => p.id === item.sku);
                if (product && product.downloadUrl) {
                    downloadLinksHtml += `<li><strong>${product.name}</strong>: <a href="${product.downloadUrl}" style="color: #F4B4C9; text-decoration: none;">Download Here</a></li>`;
                } else {
                    downloadLinksHtml += `<li><strong>${item.name}</strong>: Download link could not be found. Please contact support.</li>`;
                }
            }
        }
        
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D0B4F4;">Thank You for Your Order, ${payerName}!</h2>
                <p>Your payment has been successfully processed. We're so excited to share our creations with you.</p>
                <p>You can download your purchased digital goods using the links below:</p>
                <ul style="list-style-type: none; padding-left: 0; margin-top: 20px; margin-bottom: 20px;">
                    ${downloadLinksHtml || '<li>No downloadable items were found in your order. Please contact support if this is an error.</li>'}
                </ul>
                <p>If you have any questions or need assistance, please reply to this email or contact us at <a href="mailto:hello@cuddleia.com" style="color: #F4B4C9;">hello@cuddleia.com</a>.</p>
                <p>With love,<br><strong>The Cuddleia Team</strong></p>
            </div>
        `;

        try {
            await sendEmail({
                to: payerEmail,
                subject: 'Your Cuddleia Order Confirmation & Downloads',
                html: emailHtml,
            });
        } catch (emailError) {
             // Log the error, but don't fail the request since the payment was successful.
             console.error("Payment was successful, but the confirmation email failed to send:", emailError);
        }
    }

    // Return the full capture result to the frontend
    return NextResponse.json(captureData);

  } catch (err: any) {
    console.error("capture-order error:", err);
    return NextResponse.json({ error: err.message || "Capture order failed" }, { status: 500 });
  }
}
