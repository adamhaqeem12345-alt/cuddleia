import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { message: 'This endpoint is no longer active.' },
        { status: 410 } // 410 Gone
    );
}
