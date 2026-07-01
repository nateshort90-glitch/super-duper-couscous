// db.server.ts
let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  
  const { Database } = await import("bun:sqlite");
  const dbPath = "/home/team/shared/bountyfix.db";
  dbInstance = new Database(dbPath);
  return dbInstance;
}

// Helper to ensure categories exist for development
export async function seedCategories() {
  const db = await getDb();
  const categories = [
    { name: "Home Repair", slug: "home-repair", description: "Drywall, flooring, carpentry, and general DIY guidance." },
    { name: "Auto Mechanics", slug: "auto-mechanics", description: "Engine noises, dashboard lights, or pre-purchase advice." },
    { name: "Plumbing", slug: "plumbing", description: "Leaky faucets, water pressure issues, or pipe routing." },
    { name: "Electrical", slug: "electrical", description: "Flickering lights, outlet issues, and smart home wiring." },
    { name: "Legal & Contracts", slug: "legal", description: "Quick review of terms or help understanding a clause." },
    { name: "Tech Support", slug: "tech", description: "Software bugs, hardware setup, or networking help." },
    { name: "Creative/Design", slug: "creative", description: "Feedback on logos, UX flows, or video editing tips." }
  ];

  const insert = db.prepare("INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)");
  for (const cat of categories) {
    insert.run(crypto.randomUUID(), cat.name, cat.slug, cat.description);
  }
}
