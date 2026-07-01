// db.server.ts
// Local SQLite via bun:sqlite. Cloudflare D1 credentials are saved in .env
// and ready for migration when needed — the env vars are already set.

let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  
  const { Database } = await import("bun:sqlite");
  const dbPath = "/home/team/shared/bountyfix.db";
  dbInstance = new Database(dbPath);
  dbInstance.exec("PRAGMA journal_mode=WAL");
  return dbInstance;
}

// Helper to ensure categories exist
export async function seedCategories() {
  const db = await getDb();
  const categories = [
    { id: "cat-home", name: "Home Repair", slug: "home-repair", description: "Drywall, flooring, carpentry, and general DIY guidance." },
    { id: "cat-auto", name: "Auto Mechanics", slug: "auto-mechanics", description: "Engine noises, dashboard lights, or pre-purchase advice." },
    { id: "cat-plumbing", name: "Plumbing", slug: "plumbing", description: "Leaky faucets, water pressure issues, or pipe routing." },
    { id: "cat-electrical", name: "Electrical", slug: "electrical", description: "Flickering lights, outlet issues, and smart home wiring." },
    { id: "cat-legal", name: "Legal & Contracts", slug: "legal", description: "Quick review of terms or help understanding a clause." },
    { id: "cat-tech", name: "Tech Support", slug: "tech", description: "Software bugs, hardware setup, or networking help." },
    { id: "cat-creative", name: "Creative/Design", slug: "creative", description: "Feedback on logos, UX flows, or video editing tips." }
  ];

  const insert = db.prepare("INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)");
  for (const cat of categories) {
    insert.run(cat.id, cat.name, cat.slug, cat.description);
  }
}