import express from "express";
import providersRouter from "./routes/providers";
import { testUserMiddleware } from "./middleware/testUser";
import { sequelize } from "./db";

const app = express();
app.use(express.json());
app.use(testUserMiddleware);
app.use("/providers", providersRouter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

if (import.meta.url === `file://${process.argv[1]}` || process.env.RUN_SERVER === "1") {
  const port = Number(process.env.PORT ?? 3000);
  sequelize.authenticate().then(() => {
    console.log("DB connected");
    app.listen(port, () => console.log(`Server running on ${port}`));
  }).catch((e) => {
    console.error("DB connection failed", e);
    process.exit(1);
  });
}

export default app;