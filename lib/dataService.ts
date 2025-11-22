import { dynamoDb, TABLES } from './dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { migrateAllUserData } from './migrateToDynamo';

export class DataService {
  static DEFAULT_SETTINGS = {
    defaultCategories: {
      winery: true,
      cidery: false,
      brewery: false,
      distillery: false
    },
    communicationPreferences: {
      email: true,
      phone: false
    },
    enableAlerts: true,
    alertRadius: 25
  };

  static async getUserSettings(userId: string) {
    try {
      const { Item } = await dynamoDb.send(new GetCommand({
        TableName: TABLES.USER_SETTINGS,
        Key: { userId }
      }));
      return Item || DataService.DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load user settings:', error);
      throw error;
    }
  }
  
  static async saveUserSettings(userId: string, settings: any) {
    try {
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.USER_SETTINGS,
        Item: { userId, ...settings }
      }));
      return true;
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw error;
    }
  }
  
  static async getWineryVisits(userId: string) {
    try {
      const { Items } = await dynamoDb.send(new QueryCommand({
        TableName: TABLES.WINERY_VISITS,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));
      return Items || [];
    } catch (error) {
      console.error('Failed to load winery visits:', error);
      throw error;
    }
  }
  
  static async saveWineryVisit(userId: string, wineryId: string, visitData: any) {
    const visitId = visitData.visitId || new Date().toISOString();
    try {
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.WINERY_VISITS,
        Item: {
          userId,
          visitId,
          wineryId,
          ...visitData
        }
      }));
      return { success: true, visitId };
    } catch (error) {
      console.error('Failed to save winery visit:', error);
      throw error;
    }
  }
}
