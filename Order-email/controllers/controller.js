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
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // e.g., help@shifayaab.com
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Build products list HTML
    const productListHTML = products
      .map(
        (item, index) => `
        <div style="margin-bottom: 15px;">
          <p><strong>Product ${index + 1}:</strong></p>
          <p>Title: ${item.title}</p>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: Rs. ${item.price}</p>
        </div>
      `
      )
      .join("");

    // ✅ Attachments for admin email (images as inline)
    const attachments = products.map((item, index) => ({
      filename: `product${index}.png`,
      path: item.image,
      cid: `product${index}`,
    }));

    // ✅ Admin Email
    const adminMailOptions = {
      from: `"Shifayaab Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL, // Admin email from .env
      subject: "🛍️ New Order Received",
      html: `
        <h2>📥 New Order Notification</h2>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Address:</strong> ${address}</p>
        <hr />
        <h3>🛒 Ordered Products:</h3>
        ${products
          .map(
            (item, index) => `
          <div style="margin-bottom: 15px;">
            <p><strong>${item.title}</strong></p>
            <p>Qty: ${item.quantity}</p>
            <p>Price: Rs. ${item.price}</p>
            <img src="cid:product${index}" width="150" style="margin-top:5px; border:1px solid #ddd; padding:5px;" />
          </div>
        `
          )
          .join("")}
        <hr />
        <p><strong>Total Items:</strong> ${products.length}</p>
      `,
      attachments,
    };

    // ✅ Customer Email
    const customerMailOptions = {
      from: `"Shifayaab" <${process.env.EMAIL_USER}>`,
      to: email, // Customer email
      subject: "✅ Your Order Has Been Received!",
      html: `
        <h2>Thank You for Your Order, ${name}!</h2>
        <p>Your order has been successfully placed. Our team will contact you soon.</p>
        <h3>Order Summary:</h3>
        ${productListHTML}
        <p><strong>Total Items:</strong> ${products.length}</p>
        <p>Delivery Address: ${address}</p>
        <hr />
        <p>If you have any questions, reply to this email or contact us on WhatsApp: 0300-0174432</p>
        <br/>
        <p>Best regards,<br/>Shifayaab Team</p>
      `,
    };

    // ✅ Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    res.status(200).json({ message: "✅ Order email sent to admin and confirmation email sent to customer!" });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Failed to send emails." });
  }
});

export default router;
