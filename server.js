import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Twilio from "twilio";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));


// ===== Connect to MongoDB =====
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

// ===== Schema & Model =====
const FormSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  submittedAt: { type: Date, default: Date.now }
});
const Consultation = mongoose.model("Consultation", FormSchema);

// ===== Nodemailer Setup (Email) =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NOTIFY_EMAIL,
    pass: process.env.NOTIFY_PASS
  }
});

// ===== Twilio Setup (WhatsApp) =====
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// ===== Route: Handle Form Submission =====
app.post("/submit", async (req, res) => {
  try {
    // Save form data to MongoDB
    const data = new Consultation(req.body);
    await data.save();
    console.log("Data saved to MongoDB");

    const {
      name,
      phone,
      service
    } = req.body;

    // ===== 1. Send Email =====
    const mailOptions = {
      from: process.env.NOTIFY_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: "🔮 New Astrovastu Consultation Request",
      html: `
        <h3>New Consultation Request Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Selected Service:</strong> ${service}</p>
        <hr/>
        <p>Submitted on: ${new Date().toLocaleString()}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Email notification sent!");

    // ===== 2. Send WhatsApp Notification =====
    const message = 
` *New Astrovastu Consultation Request*

   *Name:* ${name}
   *Phone:* ${phone}
   *Selected Service:* ${service}

🗓 *Submitted On:* ${new Date().toLocaleString()}`;

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER, // your Twilio sandbox number
      to: process.env.TARGET_WHATSAPP_NUMBER,   // recipient's WhatsApp
      body: message
    });

    console.log(".");

    res.status(200).json({ message: "Data saved, email & WhatsApp notifications sent!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: " OR Check you are connected you internet" });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 