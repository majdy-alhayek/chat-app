const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());
app.use(cors());

// السماح بتتبع الـ IP الصحيح محلياً ليعمل الـ Rate Limiter بشكل دقيق
app.set('trust proxy', 1);

// مفتاح سري خاص بالتوكن
const JWT_SECRET = 'your_super_secret_key_here';

// الاتصال بقاعدة البيانات في Laragon
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "chitchat_db",
});

db.connect((err) => {
  if (err) {
    console.error("خطأ في الاتصال بقاعدة البيانات: ", err);
    return;
  }
  console.log("تم الاتصال بقاعدة البيانات بنجاح!");
});

// دالة الوسيط للتحقق من صحة الـ Token وحماية المسارات
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // استخراج التوكن

  if (!token) {
    return res.status(401).json({ error: 'غير حاصل على صلاحية الوصول، يرجى تسجيل الدخول' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'التوكن غير صالح أو انتهت صلاحيته' });
    req.user = user;
    next();
  });
};

// إعداد قيود محاولات تسجيل الدخول (Rate Limiter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // الحد الأقصى 5 محاولات لكل IP
  message: {
    error: 'لقد تجاوزت الحد المسموح من محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// 1. إنشاء حساب جديد (Signup Endpoint)
// ==========================================
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  // التحقق من قوة كلمة السر: حرف كبير، حرف صغير، ورمز خاص
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      error: "كلمة المرور ضعيفة يجب أن تحتوي على حرف كبير، حرف صغير، ورمز خاص على الأقل",
    });
  }

  try {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          return res.status(400).json({ error: "المستخدم مسجل مسبقاً، عليه تسجيل الدخول" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        
        db.query(query, [name, email, hashedPassword], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          res.status(201).json({
            message: "تم إنشاء الحساب بنجاح",
            user: {
              id: result.insertId,
              name,
              email,
            },
          });
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

// ==========================================
// 2. تسجيل الدخول (Login Endpoint) مع الحماية (Rate Limiter)
// ==========================================
app.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير مسجل' });
    }

    const user = results[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  });
});

// ==========================================
// 3. جلب جميع الرسائل (محمية بـ verifyToken)
// ==========================================
app.get("/messages", verifyToken, (req, res) => {
  db.query("SELECT * FROM messages ORDER BY created_at ASC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ==========================================
// 4. إرسال رسالة جديدة (محمية بـ verifyToken)
// ==========================================
app.post("/messages", verifyToken, (req, res) => {
  const { sender, message } = req.body;
  if (!sender || !message) {
    return res.status(400).json({ error: "المرسل والرسالة مطلوبان" });
  }

  const query = "INSERT INTO messages (sender, message) VALUES (?, ?)";
  db.query(query, [sender, message], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, sender, message });
  });
});

// تشغيل السيرفر
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`السيرفر يعمل بنجاح على المنفذ ${PORT}`);
});