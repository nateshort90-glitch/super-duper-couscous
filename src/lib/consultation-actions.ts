import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db.server";
import { getCurrentUser } from "./auth-actions";

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
    
    // Handle api.video upload
    const apiKey = process.env.API_VIDEO_API_KEY;
    const base64Data = videoData.split(",")[1] || videoData;
    const buffer = Buffer.from(base64Data, "base64");
    
    let videoUrl = "";
    try {
      // 1. Create video container
      const createRes = await fetch("https://ws.api.video/videos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title,
          description: description
        })
      });
      
      if (!createRes.ok) {
        throw new Error(`api.video create failed: ${await createRes.text()}`);
      }
      
      const videoObj = await createRes.json();
      const videoId = videoObj.videoId;
      
      // 2. Upload source
      const formData = new FormData();
      const blob = new Blob([buffer], { type: "video/webm" });
      formData.append("file", blob, "video.webm");
      
      const uploadRes = await fetch(`https://ws.api.video/videos/${videoId}/source`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error(`api.video upload failed: ${await uploadRes.text()}`);
      }
      
      const finalVideoObj = await uploadRes.json();
      videoUrl = finalVideoObj.assets.player;
    } catch (uploadError: any) {
      console.error("api.video error:", uploadError);
      throw new Error("Failed to host video. Please try again.");
    }

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
