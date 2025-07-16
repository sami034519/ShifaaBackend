import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, whatsapp, address, products } = req.body;

  // Validate required fields
  if (!name || !email || !whatsapp || !address || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "All fields and at least one product are required" });
  }

  try {
    // ✅ Configure Hostinger SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,         // Use 587 for TLS if needed
      secure: true,      // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // e.g., help@shifayaab.com
        pass: process.env.EMAIL_PASS, // email password from Hostinger
      },
    });

    // ✅ Build products HTML dynamically
    const productListHTML = products.map((item, index) => `
      <div style="margin-bottom: 15px;">
        <p><strong>Product ${index + 1}:</strong></p>
        <p>Title: ${item.title}</p>
        <p>Quantity: ${item.quantity}</p>
        <p>Price: Rs. ${item.price}</p>
        <img src="${item.image}" alt="${item.title}" width="150" style="margin-top:5px; border:1px solid #ddd; padding:5px;" />
      </div>
    `).join("");

    // ✅ Compose email to admin
    const mailOptions = {
      from: `"Shifayaab Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL, // your inbox
      subject: "🛍️ New Order Received",
      html: `
        <h2>📥 New Order Notification</h2>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Address:</strong> ${address}</p>
        <hr />
        <h3>🛒 Ordered Products:</h3>
        ${productListHTML}
        <hr />
        <p><strong>Total Items:</strong> ${products.length}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "✅ Order email sent successfully with all products!" });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

export default router;
