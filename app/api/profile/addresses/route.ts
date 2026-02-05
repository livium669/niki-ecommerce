
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { addressTable } from '@/lib/db/schemas/commerce';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';

// Helper to get user session on server
async function getSession(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await db
      .select()
      .from(addressTable)
      .where(
        and(
          eq(addressTable.userId, session.user.id),
          eq(addressTable.isProfileVisible, true)
        )
      );

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { line1, line2, city, state, country, postalCode, isDefault } = body;

    // Simple validation
    if (!line1 || !city || !state || !country || !postalCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If setting as default, unset other default addresses for this user
    if (isDefault) {
      await db
        .update(addressTable)
        .set({ isDefault: false })
        .where(
            eq(addressTable.userId, session.user.id)
        );
    }

    const newAddress = await db.insert(addressTable).values({
      id: uuidv4(),
      userId: session.user.id,
      type: 'shipping', // Defaulting to shipping for now
      line1,
      line2,
      city,
      state,
      country,
      postalCode,
      isDefault: isDefault || false,
    }).returning();

    return NextResponse.json(newAddress[0]);
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
