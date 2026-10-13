import { NextResponse } from 'next/server';
import { getCountry } from '@/lib/locationServer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const country = await getCountry(searchParams);

    // console.log("country", country)

    return NextResponse.json({ country });
}
