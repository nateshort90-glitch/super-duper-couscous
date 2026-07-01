import { createServerFn } from "@tanstack/react-start";
import { hashPassword, comparePassword, createToken, getAuthCookie } from "./auth.server";

export const registerUser = createServerFn({ method: "POST" })
  .validator((data: any) => {
    if (!data.email || !data.password || !data.name || !data.role) {
      throw new Error("Missing required fields");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { getDb, seedCategories } = await import("./db.server");
    const db = await getDb();
    const { email, password, name, role, categoryIds } = data;
    
    // Initialize DB categories if they don't exist
    try {
      await seedCategories();
    } catch (e) {
      console.error("Failed to seed categories:", e);
    }

    // Check if user exists
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    try {
      db.transaction(() => {
        db.prepare("INSERT INTO users (id, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)")
          .run(userId, email, name, hashedPassword, role);

        if (role === "expert" && categoryIds && Array.isArray(categoryIds)) {
          const insertExpertCat = db.prepare("INSERT INTO expert_categories (expert_id, category_id) VALUES (?, ?)");
          for (const catId of categoryIds) {
            insertExpertCat.run(userId, catId);
          }
        }
      })();

      const token = await createToken({ userId, email, role });
      const cookie = await getAuthCookie(token);
      
      // Try to set cookie via vinxi if available
      try {
        const { appendResponseHeader, getEvent } = await import("vinxi/http");
        const event = getEvent();
        if (event) {
          appendResponseHeader(event, "Set-Cookie", cookie);
        }
      } catch (e) {
        console.warn("Could not set cookie via vinxi:", e);
      }
      
      return { success: true, userId, token, role };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to register user");
    }
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: any) => {
    if (!data.email || !data.password) {
      throw new Error("Missing email or password");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { getDb } = await import("./db.server");
    const db = await getDb();
    const { email, password } = data;

    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    const cookie = await getAuthCookie(token);

    try {
      const { appendResponseHeader, getEvent } = await import("vinxi/http");
      const event = getEvent();
      if (event) {
        appendResponseHeader(event, "Set-Cookie", cookie);
      }
    } catch (e) {
      console.warn("Could not set cookie via vinxi:", e);
    }
    
    return { 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    };
  });

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getDb } = await import("./db.server");
    const db = await getDb();
    return db.prepare("SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC").all();
  });

export const logoutUser = createServerFn({ method: "POST" })
  .handler(async () => {
    const { getLogoutCookie } = await import("./auth.server");
    const cookie = await getLogoutCookie();
    
    try {
      const { appendResponseHeader, getEvent } = await import("vinxi/http");
      const event = getEvent();
      if (event) {
        appendResponseHeader(event, "Set-Cookie", cookie);
      }
    } catch (e) {
      console.warn("Could not set cookie via vinxi:", e);
    }
    
    return { success: true };
  });

export const getCurrentUser = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getEvent } = await import("vinxi/http");
    const { getUserIdFromRequest, verifyToken } = await import("./auth.server");
    const { getDb } = await import("./db.server");
    const { parseCookie } = await import("cookie");
    
    const event = getEvent();
    if (!event) return null;
    
    const cookieHeader = event.node.req.headers.cookie;
    if (!cookieHeader) return null;
    
    const cookies = parseCookie(cookieHeader);
    const token = cookies["bf_auth"];
    if (!token) return null;
    
    const payload = await verifyToken(token);
    if (!payload) return null;
    
    const db = await getDb();
    const user: any = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(payload.userId);
    return user || null;
  });
