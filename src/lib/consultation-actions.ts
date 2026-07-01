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

    const paymentUrl = isExpress 
      ? "https://buy.stripe.com/4gM7sN3T9gFC8vW5ByaMU01" 
      : "https://buy.stripe.com/cNi7sN75lfBybI86FCaMU00";

    try {
      db.prepare(`
        INSERT INTO consultations (
          id, client_id, category_id, title, description, 
          video_url, bounty_amount, is_express, express_surcharge, 
          status, expires_at, payment_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        consultationId, user.id, categoryId, title, description,
        videoUrl, bountyAmount, isExpress ? 1 : 0, expressSurcharge,
        'pending_payment', expiresAt, paymentUrl
      );

      return { success: true, consultationId, paymentUrl };
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
      SELECT c.*, cat.name as category_name, r.video_url as response_video_url, r.notes as response_notes,
             rat.score as rating_score, rat.feedback as rating_feedback
      FROM consultations c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN responses r ON c.id = r.consultation_id
      LEFT JOIN ratings rat ON c.id = rat.consultation_id
      WHERE c.client_id = ?
      ORDER BY c.created_at DESC
    `).all(user.id);
  });

export const submitRating = createServerFn({ method: "POST" })
  .validator((data: any) => {
    if (!data.consultationId || !data.score) {
      throw new Error("Missing required fields");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { consultationId, score, feedback } = data;
    const db = await getDb();

    // Verify consultation is completed and belongs to user
    const consultation: any = db.prepare("SELECT * FROM consultations WHERE id = ? AND client_id = ? AND status = 'completed'").get(consultationId, user.id);
    if (!consultation) {
      throw new Error("Consultation not found, not completed, or not yours");
    }

    // Check if already rated
    const existing: any = db.prepare("SELECT id FROM ratings WHERE consultation_id = ?").get(consultationId);
    if (existing) {
      throw new Error("Consultation already rated");
    }

    const ratingId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO ratings (id, consultation_id, client_id, expert_id, score, feedback)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(ratingId, consultationId, user.id, consultation.expert_id, score, feedback || "");

    return { success: true, ratingId };
  });

export const getAvailableBounties = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'expert') {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    // Get bounties in categories the expert is specialized in, that are 'open'
    // and haven't expired.
    return db.prepare(`
      SELECT c.*, cat.name as category_name, u.name as client_name
      FROM consultations c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.client_id = u.id
      WHERE c.status = 'open' 
      AND c.expires_at > datetime('now')
      AND c.category_id IN (
        SELECT category_id FROM expert_categories WHERE expert_id = ?
      )
      ORDER BY c.is_express DESC, c.created_at ASC
    `).all(user.id);
  });

export const claimBounty = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: consultationId }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'expert') {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    
    const result = db.prepare(`
      UPDATE consultations 
      SET expert_id = ?, status = 'claimed', claimed_at = datetime('now')
      WHERE id = ? AND status = 'open' AND expires_at > datetime('now')
    `).run(user.id, consultationId);

    if (result.changes === 0) {
      throw new Error("Could not claim bounty. It may have been claimed or expired.");
    }

    return { success: true };
  });

export const getClaimedConsultation = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: consultationId }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'expert') {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    return db.prepare(`
      SELECT c.*, cat.name as category_name, u.name as client_name
      FROM consultations c
      JOIN categories cat ON c.category_id = cat.id
      JOIN users u ON c.client_id = u.id
      WHERE c.id = ? AND c.expert_id = ?
    `).get(consultationId, user.id);
  });

export const submitResponse = createServerFn({ method: "POST" })
  .validator((data: any) => {
    if (!data.consultationId || !data.videoData) {
      throw new Error("Missing required fields");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'expert') {
      throw new Error("Unauthorized");
    }

    const { consultationId, videoData, notes } = data;
    const db = await getDb();

    // Verify ownership
    const consultation: any = db.prepare("SELECT * FROM consultations WHERE id = ? AND expert_id = ?").get(consultationId, user.id);
    if (!consultation) {
      throw new Error("Consultation not found or not claimed by you");
    }

    // api.video upload
    const apiKey = process.env.API_VIDEO_API_KEY;
    const base64Data = videoData.split(",")[1] || videoData;
    const buffer = Buffer.from(base64Data, "base64");
    
    let videoUrl = "";
    try {
      const createRes = await fetch("https://ws.api.video/videos", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `Response to: ${consultation.title}`,
          description: notes || ""
        })
      });
      
      const videoObj = await createRes.json();
      const videoId = videoObj.videoId;
      
      const formData = new FormData();
      const blob = new Blob([buffer], { type: "video/webm" });
      formData.append("file", blob, "response.webm");
      
      const uploadRes = await fetch(`https://ws.api.video/videos/${videoId}/source`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        },
        body: formData
      });

      const finalVideoObj = await uploadRes.json();
      videoUrl = finalVideoObj.assets.player;
    } catch (e) {
      console.error("api.video error:", e);
      throw new Error("Failed to host response video");
    }

    const responseId = crypto.randomUUID();

    try {
      db.transaction(() => {
        db.prepare(`
          INSERT INTO responses (id, consultation_id, expert_id, video_url, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(responseId, consultationId, user.id, videoUrl, notes || "");

        db.prepare(`
          UPDATE consultations SET status = 'completed', completed_at = datetime('now')
          WHERE id = ?
        `).run(consultationId);

        // Track earnings
        const gross = consultation.bounty_amount;
        const platformFee = Math.floor(gross * 0.20);
        const net = gross - platformFee;
        
        db.prepare(`
          INSERT INTO expert_earnings (id, expert_id, consultation_id, gross_amount_cents, platform_fee_cents, net_amount_cents, status)
          VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `).run(crypto.randomUUID(), user.id, consultationId, gross, platformFee, net);
      })();

      return { success: true, responseId };
    } catch (error: any) {
      console.error("Response submission error:", error);
      throw new Error("Failed to submit response");
    }
  });

export const getExpertEarnings = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'expert') {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    const earnings = db.prepare(`
      SELECT ee.*, c.title as consultation_title
      FROM expert_earnings ee
      JOIN consultations c ON ee.consultation_id = c.id
      WHERE ee.expert_id = ?
      ORDER BY ee.created_at DESC
    `).all(user.id);

    const stats = db.prepare(`
      SELECT 
        SUM(net_amount_cents) as total_earnings,
        SUM(CASE WHEN status = 'pending' THEN net_amount_cents ELSE 0 END) as pending_payouts,
        SUM(CASE WHEN status = 'paid' THEN net_amount_cents ELSE 0 END) as total_paid
      FROM expert_earnings
      WHERE expert_id = ?
    `).get(user.id) as any;

    return {
      earnings,
      stats: {
        totalEarnings: stats?.total_earnings || 0,
        pendingPayouts: stats?.pending_payouts || 0,
        totalPaid: stats?.total_paid || 0
      }
    };
  });

export const getPendingPayouts = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    return db.prepare(`
      SELECT ee.*, c.title as consultation_title, u.email as expert_email, u.name as expert_name
      FROM expert_earnings ee
      JOIN consultations c ON ee.consultation_id = c.id
      JOIN users u ON ee.expert_id = u.id
      WHERE ee.status = 'pending'
      ORDER BY ee.created_at ASC
    `).all();
  });

export const markAsPaid = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: earningsId }) => {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    db.prepare(`
      UPDATE expert_earnings 
      SET status = 'paid', paid_at = datetime('now')
      WHERE id = ?
    `).run(earningsId);

    return { success: true };
  });
