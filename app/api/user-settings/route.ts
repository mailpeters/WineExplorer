import { dynamoDb, TABLES } from '@/lib/dynamodb';
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  try {
    const { Item } = await dynamoDb.send(new GetCommand({
      TableName: TABLES.USER_SETTINGS,
      Key: { userId }
    }));
    
    return NextResponse.json(Item || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, settings } = await request.json();
  
  if (!userId || !settings) {
    return NextResponse.json({ error: 'userId and settings are required' }, { status: 400 });
  }
  
  try {
    await dynamoDb.send(new PutCommand({
      TableName: TABLES.USER_SETTINGS,
      Item: { userId, ...settings }
    }));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
