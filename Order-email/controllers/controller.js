import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, whatsapp, address, products } = req.body;

  // ✅ Validate fields
  if (
    !name ||
    !email ||
    !whatsapp ||
    !address ||
    !products ||
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return res.status(400).json({ error: "All fields and at least one product are required" });
  }

  try {
    // ✅ Configure Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465, // Use 587 for TLS if needed
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL_USER, // e.g., help@shifayaab.com
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Build product details with CID for each image
    const productListHTML = products
      .map(
        (item, index) => `
        <div style="margin-bottom: 15px;">
          <p><strong>Product ${index + 1}:</strong></p>
          <p>Title: ${item.title}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: Rs. ${item.price}</p>
          <img src="cid:product${index}" alt="${item.title}" width="150" style="margin-top:5px; border:1px solid #ddd; padding:5px;" />
        </div>
      `
      )
      .join("");

    // ✅ Build attachments array
    const attachments = products.map((item, index) => ({
      filename: `product${index}.png`,
      path: item.image, // External image URL
      cid: `product${index}`, // Matches img src in HTML
    }));

    // ✅ Compose email
    const mailOptions = {
      from: `"Shifayaab Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
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
      attachments, // Add inline images
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "✅ Order email sent successfully with inline images!" });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

export default router;
