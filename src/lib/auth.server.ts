const JWT_SECRET = process.env.JWT_SECRET || "bountyfix-secret-key-change-this-in-prod";
const AUTH_COOKIE_NAME = "bf_auth";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.compare(password, hash);
}

export async function createToken(payload: JWTPayload): Promise<string> {
  const jwt = await import("jsonwebtoken");
  return jwt.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  const jwt = await import("jsonwebtoken");
  try {
    return jwt.default.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthCookie(token: string) {
  const { stringifySetCookie } = await import("cookie");
  return stringifySetCookie({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getLogoutCookie() {
  const { stringifySetCookie } = await import("cookie");
  return stringifySetCookie({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const { parseCookie } = await import("cookie");
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  
  const cookies = parseCookie(cookieHeader);
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return null;
  
  const payload = await verifyToken(token);
  return payload ? payload.userId : null;
}
