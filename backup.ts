/**
 * Todoist Smart Backup & AI-Export Script (Bun + TypeScript)
 *
 * 1. Downloads full Sync API v9 data (Projects, Items, Labels, Filters).
 * 2. Restructures data into a hierarchical tree (Tasks and Projects).
 * 3. Exports global definitions for Labels and Filters.
 */

import processForAI from "./src/processForAI";

const API_TOKEN = process.env.TODOIST_API_TOKEN;
const SYNC_URL = "https://api.todoist.com/sync/v9/sync";

if (!API_TOKEN) {
  console.error("Error: TODOIST_API_TOKEN environment variable is not set.");
  process.exit(1);
}

async function performBackup() {
  console.log("🚀 Starting Todoist download...");

  try {
    const response = await fetch(SYNC_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        sync_token: "*",
        resource_types:
          '["projects", "items", "sections", "labels", "filters"]',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const rawData = await response.json();
    console.log(
      `✅ Download complete. Processing ${rawData.items.length} items...`,
    );

    const aiReadyData = processForAI(rawData);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const cleanFilename = `todoist_ai_export_${timestamp}.txt`;
    await Bun.write(cleanFilename, JSON.stringify(aiReadyData, null, 2));

    console.log(`✅ Export successful!`);
    console.log(`📂 AI Context File: ${cleanFilename}`);

    console.table(aiReadyData.meta.stats);
  } catch (error) {
    console.error("❌ Backup failed:", error);
  }
}

performBackup();
