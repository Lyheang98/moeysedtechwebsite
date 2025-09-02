import { NextResponse } from "next/server";
import { google } from "googleapis";
import keys from "../../../../spreadsheet-keys.json";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: keys.private_key,
        client_email: keys.client_email,
        client_id: keys.client_id,
        token_url: keys.token_uri,
        universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId: "1NiSShcJQe5iBwbpJzsrr957_pNXYuu5PUYqb29DatGE",
      range: "Report!A6:T35",
    });

    // Example: filter unprocessed requests
    // const unprocessedRequests = data.data.values.filter((row) => row[5] === 'Todo' || !row[5]);
    // const requests = unprocessedRequests.map((row) => ({
    //   date: row[0],
    //   listingName: row[1],
    //   contactEmail: row[2],
    //   notes: row[4],
    // }));

    return NextResponse.json({ values: data.data.values });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error getting spreadsheet data", success: false }, { status: 500 });
  }
}