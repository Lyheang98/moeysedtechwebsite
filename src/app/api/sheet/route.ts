import { NextResponse } from "next/server";
import { google } from "googleapis";
import keys from "../../../../spreadsheet-keys.json";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: keys.private_key.replace(/\\n/g, "\n"),
        client_email: keys.client_email,
        client_id: keys.client_id,
        token_url: keys.token_uri,
        universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // List of sheet IDs from environment - dynamically get all SHEET_PROVINCE_* variables
    const envVars: Record<string, string> = {};
    for (let i = 1; i <= 25; i++) {
      const envKey = `SHEET_PROVINCE_${i}`;
      const envValue = process.env[envKey];
      if (envValue) {
        envVars[`PROVINCE_${i}`] = envValue;
      }
    }
    
    // Also check for named province variables
    const namedProvinces: Record<string, string | undefined> = {
      KPC: process.env.SHEET_PROVINCE_KPC,
      BTB: process.env.SHEET_PROVINCE_BTB,
      PORSAT: process.env.SHEET_PROVINCE_PORSAT,
      PAILIN: process.env.SHEET_PROVINCE_PAILIN,
      OUDORMENCHEY: process.env.SHEET_PROVINCE_OUDORMENCHEY,
      KOMPOT: process.env.SHEET_PROVINCE_KOMPOT,
    };
    
    // Merge both sets of variables
    Object.assign(envVars, namedProvinces);
    
    console.log("Sheet env vars:", envVars);

    const sheetIds = Object.values(envVars).filter(Boolean);

    if (sheetIds.length === 0) {
      return NextResponse.json(
        {
          message: "No sheet IDs found in environment variables",
          envVars,
          success: false,
        },
        { status: 500 }
      );
    }

    const results: { sheetId: string; sheetName: string; values: any[][] }[] = [];

    for (const id of sheetIds) {
      if (!id) continue;
      try {
        // Get sheet metadata to find sheet names
        const metadata = await sheets.spreadsheets.get({ spreadsheetId: id });
        const sheetName = metadata.data.sheets?.[0].properties?.title || "Sheet1";

        // Fetch all rows from the sheet using dynamic sheet name
        const sheetData = await sheets.spreadsheets.values.get({
          spreadsheetId: id,
          range: `${sheetName}!B7:B31`,
        });

        console.log(`Fetched ${sheetData.data.values?.length || 0} rows from sheet: ${sheetName}`);

        results.push({
          sheetId: id,
          sheetName,
          values: sheetData.data.values || [],
        });
      } catch (sheetError) {
        console.error(`Error fetching data for sheet ${id}:`, sheetError);
        results.push({
          sheetId: id,
          sheetName: "Error",
          values: [],
        });
      }
    }

    return NextResponse.json({ sheets: results });
  } catch (e) {
    console.error("Error fetching sheets:", e);
    return NextResponse.json(
      { message: "Error getting spreadsheet data", success: false },
      { status: 500 }
    );
  }
}