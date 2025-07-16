import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, whatsapp, address, productTitle, quantity, image } = req.body;

  // Validate required fields
  if (!name || !email || !whatsapp || !address || !productTitle || !quantity || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // ✅ Configure Hostinger SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,         // Use 587 for TLS if needed
      secure: true,      // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // help@shifayaab.com
        pass: process.env.EMAIL_PASS, // email password from Hostinger
      },
    });

    // ✅ Compose email to admin
    const mailOptions = {
      from: `"Shifayaab Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL, // your own inbox (e.g., help@shifayaab.com)
      subject: "🛍️ New Order Received",
      html: `
        <h2>📥 New Order Notification</h2>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Address:</strong> ${address}</p>
        <hr />
        <h3>🛒 Product Info</h3>
        <p><strong>Title:</strong> ${productTitle}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <img src="${image}" alt="${productTitle}" width="200" style="margin-top:10px;" />
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "✅ Order email sent successfully!" });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

export default router;
