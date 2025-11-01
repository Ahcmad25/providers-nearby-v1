import { Router, Request, Response } from "express";
import { QueryTypes } from "sequelize";
import { sequelize } from "../db";

const router = Router();

function bbox(latitude: number, longitude: number, distanceKm: number) {
  const earthRadiusKm = 6371;
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radDist = distanceKm / earthRadiusKm;
  const minLat = lat - (radDist * 180) / Math.PI;
  const maxLat = lat + (radDist * 180) / Math.PI;
  const minLng = lng - (radDist * 180) / Math.PI / Math.cos((lat * Math.PI) / 180);
  const maxLng = lng + (radDist * 180) / Math.PI / Math.cos((lat * Math.PI) / 180);
  return { minLat, maxLat, minLng, maxLng };
}

// Define a proper TypeScript interface for the raw SQL rows
interface ProviderRow {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  distance: number;
}

router.get("/nearby", async (req: Request, res: Response) => {
  try {
    const q = req.query;
    const latitude = Number(q.latitude);
    const longitude = Number(q.longitude);
    const limit = Math.min(Number(q.limit ?? 10), 100);
    const offset = Number(q.offset ?? 0);
    const distanceKm = Number(q.distance ?? 5);
    const sortby = (q.sortby as string) ?? "distance";

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ error: "latitude and longitude are required" });
    }

    const { minLat, maxLat, minLng, maxLng } = bbox(latitude, longitude, distanceKm);
    const distanceSql = `(
      6371 * acos(
        cos(radians(:latitude)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(:longitude)) +
        sin(radians(:latitude)) * sin(radians(latitude))
      )
    )`;

    const orderSql = sortby === "rating" ? `p.rating DESC` : `distance ASC`;

    const sql = `
      SELECT p.id, p.name, p.latitude, p.longitude, p.rating,
             ${distanceSql} as distance
      FROM providers p
      WHERE p.latitude BETWEEN :minLat AND :maxLat
        AND p.longitude BETWEEN :minLng AND :maxLng
      HAVING distance <= :distanceKm
      ORDER BY ${orderSql}
      LIMIT :limit OFFSET :offset
    `;

    // 👇 Properly type the query to return ProviderRow[]
    const results = await sequelize.query<ProviderRow>(sql, {
      replacements: { latitude, longitude, minLat, maxLat, minLng, maxLng, distanceKm, limit, offset },
      type: QueryTypes.SELECT,
    });

    // results is now ProviderRow[] directly (no need to destructure)
    const rows = results.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      rating: Number(r.rating),
      distance: Number(r.distance),
    }));

    // ✅ Handle test user (injected from middleware)
    const testInfo = (req as any).testUser;
    if (testInfo?.isTestUser) {
      const extra = testInfo.getTestProviders(latitude, longitude, distanceKm);
      const ids = new Set(rows.map((r) => r.id));
      for (const e of extra) if (!ids.has(e.id)) rows.unshift(e);
    }

    res.json({ results: rows, count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
