import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
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
    console.log("Registering user:", email, role);
    
    try {
      await seedCategories();
    } catch (e) {
      console.error("Failed to seed categories:", e);
    }

    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existingUser) {
      console.log("User already exists:", email);
      throw new Error("User already exists");
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);
    console.log("Hashed password for:", email);

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
      console.log("User inserted into DB:", userId);

      const token = await createToken({ userId, email, role });
      const cookie = await getAuthCookie(token);
      
      console.log("Setting auth cookie");
      setResponseHeader("Set-Cookie", cookie);
      
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

    setResponseHeader("Set-Cookie", cookie);
    
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
    
    setResponseHeader("Set-Cookie", cookie);
    
    return { success: true };
  });

export const getCurrentUser = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    try {
      const { verifyToken } = await import("./auth.server");
      const { getDb } = await import("./db.server");
      const { parseCookie } = await import("cookie");
      
      const cookieHeader = request.headers.get("Cookie");
      if (!cookieHeader) return null;
      
      const cookies = parseCookie(cookieHeader);
      const token = cookies["bf_auth"];
      if (!token) return null;
      
      const payload = await verifyToken(token);
      if (!payload) return null;
      
      const db = await getDb();
      const user: any = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(payload.userId);
      return user || null;
    } catch (e) {
      console.warn("Error getting current user:", e);
      return null;
    }
  });
