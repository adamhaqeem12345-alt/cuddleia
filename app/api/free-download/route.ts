
// This file is intentionally left empty.
// The logic for free downloads has been moved to a server action in `app/actions.ts`.
// This is a more modern and reliable pattern in Next.js that avoids serverless function cold starts
// and potential timeout issues associated with API routes calling other API routes.
//
// We are keeping this file to prevent any 404 errors if old client-side code still references it,
// but all new free download requests are handled by the server action.

import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { error: 'This endpoint is deprecated. Please use the server action.' },
        { status: 410 } // 410 Gone
    );
}
