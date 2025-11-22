import { dynamoDb, TABLES } from '@/lib/dynamodb';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';
import { DEFAULT_SETTINGS } from '@/lib/user-settings';

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
    
    return NextResponse.json(Item || DEFAULT_SETTINGS);
  } catch (error) {
    console.error('DynamoDB GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, settings, defaultCategories } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Handle both formats: { userId, settings } or { userId, defaultCategories }
    const itemToSave = settings || { defaultCategories };
    
    await dynamoDb.send(new PutCommand({
      TableName: TABLES.USER_SETTINGS,
      Item: { userId, ...itemToSave }
    }));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DynamoDB POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
