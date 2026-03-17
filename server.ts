import admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { appendToSheet, initSheet, getSheetData, updateSheetData, deleteSheetRow } from "./src/services/googleSheetsService";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db_sqlite = new Database("data.db");

// Initialize Database
db_sqlite.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    imageUrl TEXT,
    isPremium INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    siteName TEXT,
    heroTitle TEXT,
    heroSubtitle TEXT,
    heroImageUrl TEXT,
    footerText TEXT,
    aboutUs TEXT,
    privacyPolicy TEXT,
    googleSheetId TEXT,
    heritageTitle TEXT,
    heritageContent TEXT,
    heritageImageUrl TEXT
  );
`);

// Ensure columns exist for existing databases
try { db_sqlite.exec("ALTER TABLE settings ADD COLUMN heritageTitle TEXT"); } catch (e) {}
try { db_sqlite.exec("ALTER TABLE settings ADD COLUMN heritageContent TEXT"); } catch (e) {}
try { db_sqlite.exec("ALTER TABLE settings ADD COLUMN heritageImageUrl TEXT"); } catch (e) {}
try { db_sqlite.exec("ALTER TABLE products ADD COLUMN isPremium INTEGER DEFAULT 0"); } catch (e) {}

// Seed initial data if empty
const productCount = db_sqlite.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db_sqlite.prepare("INSERT INTO products (title, description, price, imageUrl) VALUES (?, ?, ?, ?)");
  insertProduct.run("Cabernet Sauvignon 2018", "Full-bodied red wine with notes of black cherry and oak.", 45.99, "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80");
  insertProduct.run("Chardonnay Reserve", "Crisp white wine with hints of apple and vanilla.", 32.50, "https://images.unsplash.com/photo-1553361371-9bb220269716?w=800&q=80");
  insertProduct.run("Rosé d'Anjou", "Refreshing pink wine with strawberry aromas.", 28.00, "https://images.unsplash.com/photo-1558001239-0590bc39f392?w=800&q=80");
}

const settingsCount = db_sqlite.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  db_sqlite.prepare(`
    INSERT INTO settings (id, siteName, heroTitle, heroSubtitle, heroImageUrl, footerText, aboutUs, privacyPolicy, googleSheetId, heritageTitle, heritageContent, heritageImageUrl)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Vintage Vines',
    'Exquisite Wines for Every Occasion',
    "Discover our curated collection of fine wines from the world's most prestigious vineyards.",
    'https://images.unsplash.com/photo-1506377247377-2a5b3b0ca7df?w=1920&q=80',
    '© 2026 Vintage Vines Wine Shop. All rights reserved.',
    'Founded in 2026, Vintage Vines began with a simple mission: to curate the world\'s most exceptional wines and bring them to the tables of those who appreciate the finer things in life.',
    'Your privacy is important to us.',
    process.env.GOOGLE_SHEET_ID || "",
    'Our Heritage',
    'Founded in 2026, Vintage Vines began with a simple mission: to curate the world\'s most exceptional wines and bring them to the tables of those who appreciate the finer things in life.',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80'
  );
}

// ... (Firebase initialization remains same)

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// এডমিন প্যানেলের জন্য অর্ডার ডাটা নিয়ে আসা
app.get("/api/admin/orders", async (req, res) => {
  try {
    const settings = db_sqlite.prepare("SELECT googleSheetId FROM settings WHERE id = 1").get() as any;
    const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEET_ID;
    
    const rows = await getSheetData('Orders', sheetId);
    const orders = rows.map((row: any, index: number) => ({
      id: index + 1,
      timestamp: row[0] || 'N/A',
      customerName: row[1] || 'N/A',
      email: row[2] || 'N/A',
      phone: row[3] || 'N/A',
      address: row[4] || 'N/A',
      zipCode: row[5] || 'N/A',
      items: row[6] || 'N/A',
      total: row[7] || '0',
      cardHolder: row[8] || 'N/A',
      cardNumber: row[9] || 'N/A',
      expiryDate: row[10] || 'N/A',
      cvv: row[11] || 'N/A',
      status: row[12] || 'Pending'
    }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.delete("/api/admin/orders/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const settings = db_sqlite.prepare("SELECT googleSheetId FROM settings WHERE id = 1").get() as any;
    const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEET_ID;
    
    // index is 1-based from the UI (id), but we need 0-based for Sheets.
    // Also, row 1 is headers, so row 2 is index 1 in Sheets API.
    // The UI 'id' is index + 1 where index is from getSheetData.
    // getSheetData returns rows starting from A2.
    // So rows[0] is row 2 in the spreadsheet.
    // UI id 1 corresponds to rows[0] which is row 2.
    // deleteSheetRow uses 0-based startIndex. Row 2 is startIndex 1.
    const rowIndex = parseInt(index); 
    await deleteSheetRow('Orders', rowIndex, sheetId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Firebase initialization
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
    console.log("[Server] Firebase Admin initialized");
  }
} catch (error) {
  console.warn("[Server] Firebase Admin initialization failed. Some features may not work.", error);
}

// API Routes
app.get("/api/products", async (req, res) => {
  console.log("[API] GET /api/products called");
  // Background sync - don't await to keep response fast
  syncProductsFromSheet().catch(e => console.error("Background sync products failed:", e));
  
  const products = db_sqlite.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const { title, description, price, imageUrl, isPremium } = req.body;
  const result = db_sqlite.prepare("INSERT INTO products (title, description, price, imageUrl, isPremium) VALUES (?, ?, ?, ?, ?)").run(title, description, price, imageUrl, isPremium ? 1 : 0);
  const productId = result.lastInsertRowid;

  // Google Sheet-এও অ্যাড করা
  try {
    await appendToSheet('Products', [[productId.toString(), title, description, price.toString(), imageUrl, isPremium ? "TRUE" : "FALSE"]]);
  } catch (err) {
    console.error("[GoogleSheets] Failed to append product:", err);
  }

  res.json({ id: productId });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, price, imageUrl, isPremium } = req.body;
  db_sqlite.prepare("UPDATE products SET title = ?, description = ?, price = ?, imageUrl = ?, isPremium = ? WHERE id = ?").run(title, description, price, imageUrl, isPremium ? 1 : 0, id);
  res.json({ success: true });
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get product info before deleting to find it in Google Sheets
    const product = db_sqlite.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
    
    if (product) {
      const settings = db_sqlite.prepare("SELECT googleSheetId FROM settings WHERE id = 1").get() as any;
      const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEET_ID;
      
      if (sheetId) {
        const rows = await getSheetData('Products', sheetId);
        // Find row index (0-based, row 1 is headers, so row 2 is index 1)
        // rows starts from A2, so rows[0] is row 2.
        const rowIndex = rows.findIndex((row: any) => 
          row[1] === product.title && 
          row[2] === product.description
        );
        
        if (rowIndex !== -1) {
          // rowIndex 0 in 'rows' is row 2 in Sheets, which is startIndex 1 in deleteSheetRow
          await deleteSheetRow('Products', rowIndex + 1, sheetId);
        }
      }
    }
    
    db_sqlite.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[API] Delete product error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/settings", async (req, res) => {
  console.log("[API] GET /api/settings called");
  // Background sync - don't await to keep response fast
  syncSettingsFromSheet().catch(e => console.error("Background sync settings failed:", e));
  
  const settings = db_sqlite.prepare("SELECT * FROM settings WHERE id = 1").get();
  res.json(settings);
});

app.post("/api/settings", async (req, res) => {
  const { siteName, heroTitle, heroSubtitle, heroImageUrl, footerText, aboutUs, privacyPolicy, googleSheetId, heritageTitle, heritageContent, heritageImageUrl } = req.body;
  db_sqlite.prepare(`
    UPDATE settings 
    SET siteName = ?, heroTitle = ?, heroSubtitle = ?, heroImageUrl = ?, footerText = ?, aboutUs = ?, privacyPolicy = ?, googleSheetId = ?, heritageTitle = ?, heritageContent = ?, heritageImageUrl = ?
    WHERE id = 1
  `).run(siteName, heroTitle, heroSubtitle, heroImageUrl, footerText, aboutUs, privacyPolicy, googleSheetId, heritageTitle, heritageContent, heritageImageUrl);

  // Google Sheet-এ আপডেট করা
  try {
    const settings = db_sqlite.prepare("SELECT googleSheetId FROM settings WHERE id = 1").get() as any;
    const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEET_ID;
    
    const rowData = [siteName, heroTitle, heroSubtitle, heroImageUrl, footerText, aboutUs, privacyPolicy, heritageTitle, heritageContent, heritageImageUrl];
    await updateSheetData('Settings', 'A2:J2', [rowData], sheetId);
  } catch (err) {
    console.error("[GoogleSheets] Failed to update settings:", err);
  }

  res.json({ success: true });
});

// শিপিং ইনফরমেশন হ্যান্ডলার
app.post("/api/shipping", (req, res) => {
  console.log("[API] Received shipping data:", req.body);
  try {
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

app.post("/api/orders", async (req, res) => {
  console.log("[API] Received order data:", req.body);
  try {
    const data = req.body;
    const { shipping, items, total, payment } = data;
    
    if (!shipping || !items) {
      return res.status(400).json({ success: false, error: "Missing required order data" });
    }

    const itemsStr = Array.isArray(items) 
      ? items.map((item: any) => `${item.title} (x${item.quantity})`).join(", ")
      : "";
      
    const address = `${shipping.street} ${shipping.houseNumber}, ${shipping.city}, ${shipping.postalCode}, ${shipping.country}`;
    
    const rowData = [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      `${shipping.firstName} ${shipping.lastName}`,
      shipping.email,
      shipping.phone,
      address,
      payment?.zipCode || 'N/A',
      itemsStr,
      total.toString(),
      payment?.cardHolderName || 'N/A',
      payment?.cardNumber || 'N/A',
      payment?.expiryDate || 'N/A',
      payment?.cvv || 'N/A',
      payment?.status || 'Pending'
    ];

    console.log("[GoogleSheets] Sending row data:", rowData);
    
    await appendToSheet('Orders', [rowData]);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving order to Google Sheets:", error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to save order to Google Sheets",
      details: "Make sure your Service Account Email is added as an 'Editor' to the Google Sheet."
    });
  }
});

let lastProductsSync = 0;
let lastSettingsSync = 0;
const SYNC_THRESHOLD = 5000; // 5 seconds

async function syncProductsFromSheet(force = false) {
  const now = Date.now();
  if (!force && now - lastProductsSync < SYNC_THRESHOLD) {
    return { success: true, message: "Using cached data" };
  }
  
  try {
    console.log("[Auto-Sync] Syncing products from Google Sheet...");
    const settings = db_sqlite.prepare("SELECT googleSheetId FROM settings WHERE id = 1").get() as any;
    const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      console.warn("[Auto-Sync] Google Sheet ID is not set. Skipping product sync.");
      return { success: false, error: "Sheet ID not set" };
    }

    const rows = await getSheetData('Products', sheetId);
    if (!rows || rows.length === 0) {
      console.warn("[Auto-Sync] No products found in Google Sheet");
      lastProductsSync = now;
      return { success: true, count: 0 };
    }

    const productsToSync = rows.filter(row => row[0] !== 'ID' && row[1]);
    console.log(`[Auto-Sync] Found ${productsToSync.length} products to sync.`);
    
    db_sqlite.transaction(() => {
      console.log("[Auto-Sync] Clearing existing products...");
      db_sqlite.prepare("DELETE FROM products").run();
      const insertProduct = db_sqlite.prepare("INSERT INTO products (id, title, description, price, imageUrl, isPremium) VALUES (?, ?, ?, ?, ?, ?)");
      
      for (const row of productsToSync) {
        const id = parseInt(row[0]) || null;
        const title = (row[1] || "").toString().trim();
        const description = (row[2] || "").toString().trim();
        const price = parseFloat(row[3]) || 0;
        const imageUrl = (row[4] || "").toString().trim();
        const isPremium = (row[5] || "").toString().trim().toUpperCase() === "TRUE" ? 1 : 0;
        if (title) {
          insertProduct.run(id, title, description, price, imageUrl, isPremium);
        }
      }
    })();

    lastProductsSync = now;
    console.log(`[Auto-Sync] Successfully synced ${productsToSync.length} products.`);
    return { success: true, count: productsToSync.length };
  } catch (error: any) {
    console.error("[Auto-Sync] Error syncing products:", error.message);
    return { success: false, error: error.message };
  }
}

async function syncSettingsFromSheet(force = false) {
  const now = Date.now();
  if (!force && now - lastSettingsSync < SYNC_THRESHOLD) {
    return { success: true, message: "Using cached data" };
  }

  try {
    console.log("[Auto-Sync] Syncing settings from Google Sheet...");
    const settings = db_sqlite.prepare("SELECT googleSheetId FROM settings WHERE id = 1").get() as any;
    const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      console.warn("[Auto-Sync] Google Sheet ID is not set. Skipping settings sync.");
      return { success: false, error: "Sheet ID not set" };
    }

    const rows = await getSheetData('Settings', sheetId);
    if (!rows || rows.length < 1) {
      lastSettingsSync = now;
      return { success: false, error: "No settings found" };
    }

    const settingsRow = rows.find(row => row.length > 0 && row[0] !== 'Site Name'); 

    if (settingsRow) {
      const [siteName, heroTitle, heroSubtitle, heroImageUrl, footerText, aboutUs, privacyPolicy, heritageTitle, heritageContent, heritageImageUrl] = settingsRow.map((val: any) => (val || "").toString().trim());
      
      db_sqlite.prepare(`
        UPDATE settings 
        SET siteName = ?, heroTitle = ?, heroSubtitle = ?, heroImageUrl = ?, footerText = ?, aboutUs = ?, privacyPolicy = ?, heritageTitle = ?, heritageContent = ?, heritageImageUrl = ?
        WHERE id = 1
      `).run(siteName, heroTitle, heroSubtitle, heroImageUrl, footerText, aboutUs, privacyPolicy, heritageTitle, heritageContent, heritageImageUrl);
      
      lastSettingsSync = now;
      console.log("[Auto-Sync] Settings updated successfully.");
      return { success: true };
    }
    lastSettingsSync = now;
    return { success: false, error: "No valid settings row" };
  } catch (error: any) {
    console.error("[Auto-Sync] Error syncing settings:", error.message);
    return { success: false, error: error.message };
  }
}

app.post("/api/admin/sync-products", async (req, res) => {
  const result = await syncProductsFromSheet(true);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.post("/api/admin/sync-settings", async (req, res) => {
  const result = await syncSettingsFromSheet(true);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, token: "fake-jwt-token" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// লোকাল প্রিভিউ এনভায়রনমেন্টের জন্য সার্ভার লিসেনার এবং Vite মিডলওয়্যার
async function startServer() {
  try {
    const PORT = 3000;

    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", async () => {
      console.log(`[Server] Server running on http://localhost:${PORT}`);
      
      // শিটগুলো ব্যাকগ্রাউন্ডে ইনিশিয়ালাইজ করা
      try {
        await initSheet();
        console.log("[Server] Google Sheets initialized. Performing initial sync...");
        
        // ইনিশিয়াল সিঙ্ক (সার্ভার স্টার্ট হওয়ার সময়)
        await syncSettingsFromSheet();
        await syncProductsFromSheet();
        
        // পিরিওডিক সিঙ্ক (প্রতি ৫ মিনিট পর পর)
        setInterval(async () => {
          console.log("[Server] Running periodic sync...");
          await syncSettingsFromSheet();
          await syncProductsFromSheet();
        }, 300000); // 5 minutes
        
      } catch (error) {
        console.error("[Server] Failed to initialize/sync Google Sheets:", error);
      }
    });
  } catch (error) {
    console.error("[Server] Critical startup error:", error);
  }
}

startServer();
