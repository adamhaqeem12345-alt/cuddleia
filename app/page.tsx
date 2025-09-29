'use client';

import { useState } from 'react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Postmortem: A Deep Dive into PayPal API Integration
          </h1>
          <p className="text-md text-gray-500 mt-2">
            Fantastic news! We finally achieved a successful transaction. Let's summarize the critical lessons learned.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">The Deceptive Error: PayPal's "code: 12"</h2>
          <p className="text-gray-600 leading-relaxed">
            This generic error from the PayPal Buttons script is deceptive. It almost never means the button itself is broken. It's a symptom of a deeper problem: the <code className="bg-gray-100 text-red-500 p-1 rounded">createOrder</code> callback failed to return a valid Order ID string to the script. Our entire struggle was a hunt for the reason why that ID wasn't being returned.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Lesson 1: Server-Side Order Creation is a Fragile Chain</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Creating orders on the server introduces a fragile chain of communication: Client {'->'} Your Server {'->'} PayPal API. A failure at any point can break the process. Our experience showed that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Subtle Payload Errors Matter:</strong> PayPal's API is extremely strict. A number instead of a string, a value without two decimal places, or a field that's one character too long will cause a rejection.</li>
            <li><strong>Error Propagation is Hard:</strong> When our server's request to PayPal failed, the specific error message wasn't correctly passed back to the client. The client just knew "something failed."</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Lesson 2: Client-Side Creation is a Robust Alternative</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our final, successful solution was to abandon server-side order creation and build the payload directly on the client. This creates a direct line of communication: Client {'->'} PayPal API. By removing our own server from the creation step, we eliminated the most complex part of the flow. This is a robust solution for use cases where the purchase logic is simple.
          </p>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="font-bold text-green-800">The Most Important Lesson: Formatting is Everything</h3>
            <p className="text-green-700 mt-1">
              Monetary values <span className="font-bold">must be a string with two decimal places</span> (e.g., <code className="bg-green-100 p-1 rounded">"15.00"</code>, not <code className="bg-red-100 p-1 rounded">15</code> or <code className="bg-red-100 p-1 rounded">"15.0"</code>). Using <code className="bg-green-100 p-1 rounded">.toFixed(2)</code> is a requirement.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Our Successful Architecture</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li><strong>Order Creation (Client-Side):</strong> The user clicks the PayPal button, and the browser constructs the simple payload (with the total amount correctly formatted) and sends it directly to PayPal to get an Order ID.</li>
            <li><strong>User Approval:</strong> The user approves the transaction in the PayPal pop-up.</li>
            <li><strong>Order Capture (Server-Side):</strong> After approval, the browser sends the Order ID to our server (<code className="bg-gray-100 text-red-500 p-1 rounded">/api/paypal/capture-order</code>). The server securely confirms the payment with PayPal and can trigger follow-up actions like sending a confirmation email.</li>
          </ol>
        </section>

        <div className="mt-10 pt-6 border-t">
          <button 
            onClick={handlePayClick}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Pay with Card
          </button>
          {isLoading && (
            <div className="mt-4 text-center text-gray-600">
              <p>Loading payment options...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
