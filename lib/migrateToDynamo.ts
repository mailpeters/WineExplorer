import { dynamoDb, TABLES } from './dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export async function migrateUserSettings(userId: string) {
  // Get data from localStorage
  const settings = localStorage.getItem(`userSettings_${userId}`);
  if (!settings) return;
  
  try {
    // Save to DynamoDB
    await dynamoDb.send(new PutCommand({
      TableName: TABLES.USER_SETTINGS,
      Item: { userId, ...JSON.parse(settings) }
    }));
    
    // Remove from localStorage
    localStorage.removeItem(`userSettings_${userId}`);
    return true;
  } catch (error) {
    console.error('Migration failed for user settings:', error);
    return false;
  }
}

export async function migrateWineryVisits(userId: string) {
  // Get data from localStorage
  const visits = localStorage.getItem(`wineryVisits_${userId}`);
  if (!visits) return;
  
  try {
    const visitsData = JSON.parse(visits);
    
    // Save each visit to DynamoDB
    for (const visit of visitsData) {
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.WINERY_VISITS,
        Item: {
          userId,
          visitId: visit.date || new Date().toISOString(),
          wineryId: visit.wineryId,
          ...visit
        }
      }));
    }
    
    // Remove from localStorage
    localStorage.removeItem(`wineryVisits_${userId}`);
    return true;
  } catch (error) {
    console.error('Migration failed for winery visits:', error);
    return false;
  }
}

export async function migrateAllUserData(userId: string) {
  const settingsSuccess = await migrateUserSettings(userId);
  const visitsSuccess = await migrateWineryVisits(userId);
  return { settingsSuccess, visitsSuccess };
}
