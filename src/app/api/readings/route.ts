import { NextResponse } from 'next/server';

import prisma from '@/app/lib/prisma';

// GET all readings
export async function GET() {
  try {
    const readings = await prisma.bPReading.findMany({
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

// POST a new reading
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { systolic, diastolic, pulse, notes, measuredAt } = body;
    
    // Validate the data
    if (!systolic || !diastolic) {
      return NextResponse.json(
        { error: 'Systolic and diastolic values are required' },
        { status: 400 }
      );
    }
    
    // Create the reading
    const reading = await prisma.bPReading.create({
      data: {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : null,
        notes: notes || null,
        measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
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