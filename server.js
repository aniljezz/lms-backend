require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ Schema
const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  message: String,
  source: String,
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model("Lead", LeadSchema);

// ✅ API
app.post("/api/add-lead", async (req, res) => {
  try {
    const { name, phone, service, message, source, api_key } = req.body;

    // 🔐 API key check
    if (api_key !== process.env.API_KEY) {
      return res.status(401).json({ success: false });
    }

    // ✅ Validation
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      return res.json({ success: false, error: "Invalid phone" });
    }

    if (message && message.length > 90) {
      return res.json({ success: false, error: "Message too long" });
    }

    // ❌ Duplicate check (10 min)
    const existing = await Lead.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (existing) {
      return res.json({ success: false, error: "Duplicate lead" });
    }

    // ✅ Save
    const lead = await Lead.create({
      name,
      phone,
      service,
      message,
      source
    });

    res.json({ success: true, data: lead });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ✅ Get leads (dashboard)
app.get("/api/leads", async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  res.json(leads);
});

app.listen(5000, () => console.log("Server running"));
