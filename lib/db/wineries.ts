import { ddbDocClient } from "@/lib/aws/dynamo";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export async function searchWineries(query: string) {
  const lower = query.toLowerCase();

  const result = await ddbDocClient.send(
    new ScanCommand({
      TableName: process.env.DYNAMODB_WINERIES_TABLE,
      FilterExpression:
        "contains(#nameLower, :q) OR contains(#cityLower, :q)",
      ExpressionAttributeNames: {
        "#nameLower": "nameLower",
        "#cityLower": "cityLower",
      },
      ExpressionAttributeValues: {
        ":q": lower,
      },
    })
  );

  return result.Items || [];
}
