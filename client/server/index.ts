// server.js
import express from "express";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createRequestHandler } from "@remix-run/express";
import productRouter from "./src/routes/product.route";
import dotenv from 'dotenv'
import { installGlobals } from "@remix-run/node";


installGlobals({ nativeFetch: true })
dotenv.config()

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP"
});

// Basic middleware
app.use(compression());
app.use(morgan("combined"));
app.use(express.json());
// app.use(limiter);


// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error:any) {
    res.status(500).json({ 
      status: "error", 
      database: "disconnected",
      error: error.message
    });
  }
});

app.use("/api/products", productRouter);

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("../build/server/index"),
});

app.disable("x-powered-by");

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
}

app.use(express.static("build/client", { maxAge: "1h" }));

// Handle all other routes with Remix
app.all(
  /(.*)/,
  remixHandler
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port  ${port}`);
});