import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Create Document client for easier operations
export const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// Table names
export const TABLES = {
  USER_SETTINGS: process.env.DYNAMODB_TABLE_SETTINGS || "WineApp-UserSettings",
  WINERY_VISITS: process.env.DYNAMODB_TABLE_VISITS || "WineApp-WineryVisits",
  RATINGS: process.env.DYNAMODB_TABLE_RATINGS || "WineApp-Ratings"
};
