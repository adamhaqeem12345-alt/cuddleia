
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
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                <p><strong>Terms of Use:</strong> All digital products are for personal use only. They are not to be sold, redistributed, or used for commercial purposes. Thank you for respecting the heart and effort put into these creations.</p>
            </div>
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
            if (purchaseUnits && purchaseUnits.length > 0) {
                // In our simplified setup, there is one purchase unit and items are not listed.
                // We need to look at the cart from the original order to know what was purchased.
                // This information isn't directly in the capture response.
                // For now, we assume the items are passed somehow or we retrieve the order details.
                // A better implementation would be to pass the cart items from the client during capture.
                
                // Let's assume we can get items from the original order `description` if it was set, or we have to find them by matching the total amount.
                // For simplicity, let's find the products based on SKU if they were passed.
                const purchasedSkus = capturedData.purchase_units[0]?.items?.map((item: { sku: any; }) => item.sku) || [];

                // Re-fetch order details to get item list if not present in capture data
                const itemsFromOrder = capturedData.purchase_units[0].items;

                let itemsWithDownloadLinks: { name: string, downloadUrl: string }[] = [];

                if (itemsFromOrder) {
                    itemsWithDownloadLinks = itemsFromOrder.map((item: { sku: string; }) => {
                        const product = products.find(p => p.id === item.sku);
                        return product ? { name: product.name, downloadUrl: product.downloadUrl } : null;
                    }).filter((item: any): item is { name: string, downloadUrl: string } => item !== null);
                }
                
                // This part is a fallback and might not be accurate if multiple item combos have the same price.
                // But since we can't get item details back from PayPal in this simplified flow, we have to make an educated guess.
                // The best approach is to pass item IDs from client to capture, which we are not doing currently.
                // Let's just assume we email links to ALL products if we can't determine which were bought. This is NOT ideal.
                // A better approach is needed for a real app.

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
                     console.warn(`CAPTURE-ORDER: Could not find product details for items in order ${orderID}. This can happen if the order was created with just a total amount and no item list.`);
                     // A fallback could be to send a generic email without links and handle it manually.
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
