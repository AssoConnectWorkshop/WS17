import { NextResponse } from 'next/server';
import { getAllContacts } from '@/lib/assoconnect';

export async function GET() {
  try {
    const contacts = await getAllContacts();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts from AssoConnect' },
      { status: 500 }
    );
  }
}
