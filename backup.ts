/**
 * Todoist Full Backup Script (Bun + TypeScript)
 * Uses the Sync API v9 to download all account data.
 */

const API_TOKEN = process.env.TODOIST_API_TOKEN;
const SYNC_URL = "https://api.todoist.com/sync/v9/sync";

if (!API_TOKEN) {
  console.error("Error: TODOIST_API_TOKEN environment variable is not set.");
  process.exit(1);
}

async function performBackup() {
  console.log("🚀 Starting Todoist full backup...");

  try {
    const response = await fetch(SYNC_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        sync_token: "*",
        resource_types: '["all"]',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `todoist_backup_${timestamp}.json`;

    await Bun.write(filename, JSON.stringify(data, null, 2));

    console.log(`✅ Backup successful!`);
    console.log(`📂 Saved to: ${filename}`);

    const summary = {
      projects: data.projects?.length || 0,
      tasks: data.items?.length || 0,
      sections: data.sections?.length || 0,
      labels: data.labels?.length || 0,
    };
    console.table(summary);
  } catch (error) {
    console.error("❌ Backup failed:", error);
  }
}

performBackup();
