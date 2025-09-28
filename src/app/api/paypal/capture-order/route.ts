
import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal-api';
import { products } from '@/lib/products';
import { sendEmail } from '@/lib/mail';

// This function constructs a basic HTML email body.
const createEmailHtml = (orderData: any, purchaseItems: any[]): string => {
    const itemsHtml = purchaseItems.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>Download Link: <a href="${item.downloadUrl}">Click here to download</a></p>
        </div>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank You for Your Cuddleia Purchase!</h2>
            <p>Hello ${orderData.payer.name.given_name},</p>
            <p>We've confirmed your payment and your digital goods are ready for download. Your order ID is <strong>${orderData.id}</strong>.</p>
            <hr>
            <h3>Your Items:</h3>
            ${itemsHtml}
            <hr>
            <p>If you have any questions or need assistance, please don't hesitate to contact us by replying to this email.</p>
            <p>Warmly,<br>The Cuddleia Team</p>
        </div>
    `;
};


export async function POST(req: Request) {
    console.log("API ROUTE: /api/paypal/capture-order received a POST request.");
    try {
        const { orderID } = await req.json();
        if (!orderID) {
            console.error("CAPTURE-ORDER API ERROR: Missing orderID in request body.");
            return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
        }

        console.log(`CAPTURE-ORDER: Calling captureOrder helper for orderID: ${orderID}`);
        const capturedData = await captureOrder(orderID);
        
        // Log the entire successful response for debugging.
        console.log(`CAPTURE-ORDER: Full response from PayPal captureOrder API:`, JSON.stringify(capturedData, null, 2));
        
        // Fulfill the order only if the capture is fully completed.
        if (capturedData.status === 'COMPLETED') {
            console.log(`CAPTURE-ORDER: Order ${orderID} is COMPLETED. Preparing to send email.`);
            
            const purchaseUnits = capturedData.purchase_units;
            if (purchaseUnits && purchaseUnits.length > 0 && purchaseUnits[0].items) {
                const purchasedItems = purchaseUnits[0].items;

                // Find the corresponding product details (like download URLs) from our products list
                const itemsWithDownloadLinks = purchasedItems.map((item: { sku: string; }) => {
                    const product = products.find(p => p.id === item.sku);
                    return product ? { name: product.name, downloadUrl: product.downloadUrl } : null;
                }).filter((item: any): item is { name: string, downloadUrl: string } => item !== null);

                if (itemsWithDownloadLinks.length > 0) {
                    const recipientEmail = capturedData.payer.email_address;
                    const emailHtml = createEmailHtml(capturedData, itemsWithDownloadLinks);
                    
                    try {
                        await sendEmail({
                            to: recipientEmail,
                            subject: 'Your Cuddleia Order & Download Links',
                            html: emailHtml,
                        });
                        console.log(`CAPTURE-ORDER: Successfully sent download links to ${recipientEmail}.`);
                    } catch (emailError) {
                         console.error(`CAPTURE-ORDER: Failed to send email for order ${orderID}.`, emailError);
                         // Note: The payment was successful, but email failed. This needs manual follow-up.
                         // We still return the success response to the client.
                    }
                } else {
                     console.warn(`CAPTURE-ORDER: Could not find product details for items in order ${orderID}.`);
                }
            }
        }
        
        // Return the full capture data to the client
        return NextResponse.json(capturedData);

    } catch (err: any) {
        console.error("CAPTURE-ORDER API CATCH BLOCK: An unexpected error occurred.", err);
        const errorMessage = err.message || "An unexpected error occurred during capture.";
        return NextResponse.json({ error: "Failed to capture PayPal order.", details: errorMessage }, { status: 500 });
    }
}
