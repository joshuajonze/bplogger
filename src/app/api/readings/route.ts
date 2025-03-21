import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET route handler for fetching readings with pagination
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const readings = await prisma.bPReading.findMany({
      skip,
      take: limit,
      orderBy: {
        measuredAt: 'desc',
      },
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}

// POST route handler for creating a new reading
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.systolic || !data.diastolic || !data.measuredAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const reading = await prisma.bPReading.create({
      data: {
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        notes: data.notes,
        measuredAt: new Date(data.measuredAt),
      },
    });
    
    return NextResponse.json(reading);
  } catch (error) {
    console.error('Error creating reading:', error);
    return NextResponse.json(
      { error: 'Failed to create reading' },
      { status: 500 }
    );
  }
}