import express from "express";
import cors from "cors";
import router from "./controllers/controller.js"; // Make sure this path is correct

const app = express();

// ✅ List of all allowed frontend domains
const allowedOrigins = [
  "https://www.shifayaab.com",
  "https://shifayaab.vercel.app",
  "http://localhost:3000", 
];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Error: Not allowed - " + origin));
      }
    },
  })
);

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Route
app.use("/api/order", router);

// ✅ Export Vercel serverless handler
export default function handler(req, res) {
  return app(req, res);
}
