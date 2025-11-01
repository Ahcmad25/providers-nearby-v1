import { Request, Response, NextFunction } from "express";

export interface TestUserInfo {
  isTestUser: boolean;
  getTestProviders: (lat: number, lng: number, distanceKm?: number) => Array<Record<string, any>>;
}

export function testUserMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = (req.headers["x-test-user"] as string) ?? "";
  const isTestUser = header === "1" || header === "true" || req.headers["x-user-id"] === "test";

  const info: TestUserInfo = {
    isTestUser,
    getTestProviders: (lat, lng, distanceKm = 10) => {
      const provider = {
        id: -999,
        name: "TEST PROVIDER",
        latitude: lat + 0.001,
        longitude: lng + 0.001,
        rating: 5.0,
        distance: Math.sqrt(0.001 * 0.001 + 0.001 * 0.001) * 111.32,
      };
      return provider.distance <= distanceKm ? [provider] : [];
    },
  };

  (req as any).testUser = info;
  next();
}