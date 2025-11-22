import { dynamoDb, TABLES } from './dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { migrateAllUserData } from './migrateToDynamo';

export class DataService {
  static async getUserSettings(userId: string) {
    try {
      // Try DynamoDB first
      const { Item } = await dynamoDb.send(new GetCommand({
        TableName: TABLES.USER_SETTINGS,
        Key: { userId }
      }));
      
      if (Item) return Item;
      
      // Fallback to localStorage
      const localData = localStorage.getItem(`userSettings_${userId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        // Attempt migration in background
        migrateAllUserData(userId);
        return parsed;
      }
      
      return {};
    } catch (error) {
      // Fallback to localStorage if error
      const localData = localStorage.getItem(`userSettings_${userId}`);
      return localData ? JSON.parse(localData) : {};
    }
  }
  
  static async saveUserSettings(userId: string, settings: any) {
    try {
      // Try DynamoDB first
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.USER_SETTINGS,
        Item: { userId, ...settings }
      }));
      
      // Also save to localStorage as fallback
      localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
      return true;
    } catch (error) {
      // Fallback to localStorage if error
      localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
      return false;
    }
  }
  
  static async getWineryVisits(userId: string) {
    try {
      // Try DynamoDB first
      const { Items } = await dynamoDb.send(new QueryCommand({
        TableName: TABLES.WINERY_VISITS,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));
      
      if (Items?.length) return Items;
      
      // Fallback to localStorage
      const localData = localStorage.getItem(`wineryVisits_${userId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        // Attempt migration in background
        migrateAllUserData(userId);
        return parsed;
      }
      
      return [];
    } catch (error) {
      // Fallback to localStorage if error
      const localData = localStorage.getItem(`wineryVisits_${userId}`);
      return localData ? JSON.parse(localData) : [];
    }
  }
  
  static async saveWineryVisit(userId: string, wineryId: string, visitData: any) {
    const visitId = visitData.visitId || new Date().toISOString();
    
    try {
      // Try DynamoDB first
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.WINERY_VISITS,
        Item: {
          userId,
          visitId,
          wineryId,
          ...visitData
        }
      }));
      
      // Also save to localStorage as fallback
      const existing = localStorage.getItem(`wineryVisits_${userId}`);
      const visits = existing ? JSON.parse(existing) : [];
      visits.push({ ...visitData, wineryId, visitId });
      localStorage.setItem(`wineryVisits_${userId}`, JSON.stringify(visits));
      
      return { success: true, visitId };
    } catch (error) {
      // Fallback to localStorage if error
      const existing = localStorage.getItem(`wineryVisits_${userId}`);
      const visits = existing ? JSON.parse(existing) : [];
      visits.push({ ...visitData, wineryId, visitId });
      localStorage.setItem(`wineryVisits_${userId}`, JSON.stringify(visits));
      
      return { success: false, visitId };
    }
  }
}
