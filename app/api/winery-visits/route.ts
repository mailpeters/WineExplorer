import { dynamoDb, TABLES } from '@/lib/dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }
  
  try {
    const { Items } = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.WINERY_VISITS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));
    
    return NextResponse.json(Items || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, wineryId, visitData } = await request.json();
  
  if (!userId || !wineryId || !visitData) {
    return NextResponse.json({ error: 'userId, wineryId and visitData are required' }, { status: 400 });
  }
  
  try {
    const visitId = new Date().toISOString();
    
    await dynamoDb.send(new PutCommand({
      TableName: TABLES.WINERY_VISITS,
      Item: {
        userId,
        visitId,
        wineryId,
        ...visitData
      }
    }));
    
    return NextResponse.json({ success: true, visitId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save visit' }, { status: 500 });
  }
}
