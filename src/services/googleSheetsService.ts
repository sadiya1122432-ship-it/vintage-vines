import { google } from 'googleapis';

// এই ভেরিয়েবলগুলো আপনার .env ফাইল থেকে আসবে
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Private Key-এর কোটেশন মার্ক এবং নিউ-লাইন ক্যারেক্টার হ্যান্ডেল করা
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  ?.replace(/^"(.*)"$/, '$1') // শুরুর এবং শেষের ডাবল কোট রিমুভ করা
  ?.replace(/\\n/g, '\n')
  ?.replace(/\n/g, '\n'); // এক্সট্রা নিউলাইন হ্যান্ডেল করা

let sheetsClient: any = null;

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  
  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    console.warn('[GoogleSheets] Missing credentials. GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY is not set.');
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('[GoogleSheets] Client initialized successfully.');
    return sheetsClient;
  } catch (err: any) {
    console.error('[GoogleSheets] Failed to initialize client:', err.message);
    return null;
  }
}

export async function appendToSheet(sheetName: string, rows: any[], spreadsheetId?: string) {
  console.log(`[GoogleSheets] Attempting to append to sheet: ${sheetName}`);
  try {
    const sheets = getSheetsClient();
    if (!sheets) throw new Error("Google Sheets client not initialized. Please check your GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in Secrets.");
    const id = spreadsheetId || SPREADSHEET_ID;
    if (!id) throw new Error("GOOGLE_SHEET_ID is not set in Secrets or Dashboard.");
    
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });
    console.log(`[GoogleSheets] Successfully appended ${rows.length} row(s) to ${sheetName}`);
    return { success: true, data: result.data };
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error('[GoogleSheets] Append Error:', errorMsg);
    throw new Error(errorMsg);
  }
}

export async function getSheetData(sheetName: string, spreadsheetId?: string) {
  try {
    const sheets = getSheetsClient();
    if (!sheets) throw new Error("Google Sheets credentials (EMAIL or PRIVATE_KEY) are missing in Secrets.");
    const id = spreadsheetId || SPREADSHEET_ID;
    if (!id) throw new Error("Google Spreadsheet ID is not set.");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: `${sheetName}!A2:Z1000`, // হেডার বাদে ডাটা রিড করা
    });

    return response.data.values || [];
  } catch (error: any) {
    console.error('[GoogleSheets] Read Error:', error.message);
    throw error; // Throw error instead of returning [] to let the caller handle it
  }
}

export async function updateSheetData(sheetName: string, range: string, rows: any[], spreadsheetId?: string) {
  try {
    const sheets = getSheetsClient();
    if (!sheets) throw new Error("Google Sheets client not initialized.");
    const id = spreadsheetId || SPREADSHEET_ID;
    if (!id) throw new Error("GOOGLE_SHEET_ID is not set.");

    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error('[GoogleSheets] Update Error:', error.message);
    throw error;
  }
}

export async function deleteSheetRow(sheetName: string, rowIndex: number, spreadsheetId?: string) {
  try {
    const sheets = getSheetsClient();
    const id = spreadsheetId || SPREADSHEET_ID;
    if (!sheets || !id) throw new Error("Google Sheets client not initialized.");

    // Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: id });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    if (!sheet) throw new Error(`Sheet ${sheetName} not found.`);
    const sheetId = sheet.properties?.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error('[GoogleSheets] Delete Error:', error.message);
    throw error;
  }
}

export async function initSheet(spreadsheetId?: string) {
  try {
    const sheets = getSheetsClient();
    const id = spreadsheetId || SPREADSHEET_ID;
    if (!sheets || !id) return;
    
    // চেক করা যে শিটগুলো আছে কিনা, না থাকলে তৈরি করা
    const response = await sheets.spreadsheets.get({
      spreadsheetId: id,
    });
    
    const existingSheets = response.data.sheets?.map(s => s.properties?.title) || [];
    
    const requiredSheets = ['Orders', 'Settings', 'Products'];
    
    for (const name of requiredSheets) {
      if (!existingSheets.includes(name)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{
              addSheet: { properties: { title: name } }
            }]
          }
        });
        
        // হেডার অ্যাড করা
        let headers: string[] = [];
        if (name === 'Orders') headers = ['Timestamp', 'Name', 'Email', 'Phone', 'Address', 'Zip Code', 'Items', 'Total', 'Card Holder', 'Card Number', 'Expiry Date', 'CVV', 'Status'];
        if (name === 'Products') headers = ['ID', 'Title', 'Description', 'Price', 'ImageURL', 'IsPremium'];
        if (name === 'Settings') headers = ['Site Name', 'Hero Title', 'Hero Subtitle', 'Hero Image URL', 'Footer Text', 'About Us', 'Privacy Policy', 'Heritage Title', 'Heritage Content', 'Heritage Image URL'];
        
        if (headers.length > 0) {
          await appendToSheet(name, [headers]);
        }
      }
    }
  } catch (error) {
    console.error('Init Sheet Error:', error);
  }
}
