import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db.server";
import { getCurrentUser } from "./auth-actions";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export const submitConsultation = createServerFn({ method: "POST" })
  .validator((data: any) => {
    if (!data.title || !data.description || !data.categoryId || !data.videoData) {
      throw new Error("Missing required fields");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { title, description, categoryId, videoData, isExpress } = data;
    const db = await getDb();

    const consultationId = crypto.randomUUID();
    const uploadDir = "/home/team/shared/uploads";
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // ignore
    }

    const videoFilename = `${consultationId}.webm`;
    const videoPath = join(uploadDir, videoFilename);
    const videoUrl = `/uploads/${videoFilename}`; 

    // Handle base64 video data
    const base64Data = videoData.split(",")[1] || videoData;
    const buffer = Buffer.from(base64Data, "base64");
    await writeFile(videoPath, buffer);

    const bountyAmount = isExpress ? 2500 : 1000;
    const expressSurcharge = isExpress ? 1000 : 0;
    
    // Expires in 45 minutes
    const expiresAt = new Date(Date.now() + 45 * 60 * 1000).toISOString();

    try {
      db.prepare(`
        INSERT INTO consultations (
          id, client_id, category_id, title, description, 
          video_url, bounty_amount, is_express, express_surcharge, 
          status, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        consultationId, user.id, categoryId, title, description,
        videoUrl, bountyAmount, isExpress ? 1 : 0, expressSurcharge,
        'open', expiresAt
      );

      return { success: true, consultationId };
    } catch (error: any) {
      console.error("Submission error:", error);
      throw new Error("Failed to submit consultation");
    }
  });

export const getUserConsultations = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    return db.prepare(`
      SELECT c.*, cat.name as category_name 
      FROM consultations c
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.client_id = ?
      ORDER BY c.created_at DESC
    `).all(user.id);
  });
