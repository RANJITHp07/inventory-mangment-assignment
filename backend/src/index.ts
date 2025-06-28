import express, { Express, Request, Response, Application } from 'express';
import cors from 'cors';  // import cors
import dotenv from 'dotenv';
import router from './routes/product.route';

// For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

// Use CORS middleware before your routes
app.use(cors({
  origin: "*", // Allow all origins (change this in production to your frontend URL)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

app.use(express.json()); // Parse JSON bodies

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

app.use("/api/products", router);

app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});
