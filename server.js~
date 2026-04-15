require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* =========================
   🔥 USER MODEL
========================= */
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

/* =========================
   🔥 LEAD MODEL
========================= */
const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  message: String,
  source: String,
  userId: String,
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.model("Lead", LeadSchema);

/* =========================
   🔥 AUTH MIDDLEWARE
========================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* =========================
   🔥 REGISTER
========================= */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hash });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   🔥 LOGIN
========================= */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.json({ success: false, error: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, "secret123", {
      expiresIn: "7d"
    });

    res.json({ success: true, token });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   🔥 GET PROFILE
========================= */
app.get("/api/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      user
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* =========================
   🔥 UPDATE PROFILE
========================= */
app.post("/api/update-profile", auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateData = { name, email };

    if (password && password.length > 0) {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }

    await User.findByIdAndUpdate(req.user.id, updateData);

    res.json({ success: true });

  } catch {
    res.status(500).json({ success: false });
  }
});

/* =========================
   🔥 ADD LEAD
========================= */
app.post("/api/add-lead", auth, async (req, res) => {
  try {
    const { name, phone, service, message, source } = req.body;

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      return res.json({ success: false, error: "Invalid phone" });
    }

    if (message && message.length > 90) {
      return res.json({ success: false, error: "Message too long" });
    }

    const existing = await Lead.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (existing) {
      return res.json({ success: false, error: "Duplicate lead" });
    }

    const lead = await Lead.create({
      name,
      phone,
      service,
      message,
      source,
      userId: req.user.id
    });

    res.json({ success: true, data: lead });

  } catch {
    res.status(500).json({ success: false });
  }
});

/* =========================
   🔥 GET USER LEADS
========================= */
app.get("/api/leads", auth, async (req, res) => {
  const leads = await Lead.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json(leads);
});

/* =========================
   🚀 SERVER
========================= */
app.listen(5000, () => console.log("Server running"));
