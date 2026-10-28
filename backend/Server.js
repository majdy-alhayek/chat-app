const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

app.set('trust proxy', 1);

const JWT_SECRET = 'your_super_secret_key_here';

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

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'غير حاصل على صلاحية الوصول، يرجى تسجيل الدخول' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'التوكن غير صالح أو انتهت صلاحيته' });
    req.user = user;
    next();
  });
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'لقد تجاوزت الحد المسموح من محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chatappchitchat@gmail.com',
    pass: 'auzgbhasrpwjnmvs'
  }
});

// 1. إنشاء حساب جديد
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      error: "كلمة المرور ضعيفة يجب أن تحتوي على حرف كبير، حرف صغير، ورمز خاص على الأقل",
    });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        return res.status(400).json({ error: "المستخدم مسجل مسبقاً" });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = "INSERT INTO users (name, email, password, verification_code, code_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, false)";
      
      db.query(query, [name, email, hashedPassword, verificationCode, codeExpiresAt], async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        try {
          await transporter.sendMail({
            from: '"ChitChat App" <chatappchitchat@gmail.com>',
            to: email,
            subject: 'رمز التحقق الخاص بك في ChitChat',
            html: `<h2>مرحباً ${name}</h2><p>رمز التحقق الخاص بك هو: <b>${verificationCode}</b></p>`
          });
        } catch (mailErr) {
          console.error("خطأ في إرسال البريد:", mailErr);
        }

        res.status(201).json({
          message: "تم إنشاء الحساب بنجاح، يرجى إدخال رمز التحقق المرسل إلى بريدك",
          email: email
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

// 2. التحقق من الحساب
app.post("/verify", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "البريد الإلكتروني ورمز التحقق مطلوبان" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "المستخدم غير موجود" });
    }

    const user = results[0];

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "رمز التحقق غير صحيح" });
    }

    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
    }

    db.query("UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = ?", [email], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "تم تفعيل الحساب بنجاح" });
    });
  });
});

// 3. تسجيل الدخول
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

    if (!user.is_verified) {
      return res.status(400).json({ error: 'الحساب غير مفعل، يرجى تفعيل الحساب برمز التحقق أولاً' });
    }

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

// 4. طلب نسيان كلمة المرور (إرسال الرمز)
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "البريد الإلكتروني غير مسجل" });
    }

    const user = results[0];
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    db.query(
      "UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?",
      [verificationCode, codeExpiresAt, email],
      async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        try {
          await transporter.sendMail({
            from: '"ChitChat App" <chatappchitchat@gmail.com>',
            to: email,
            subject: 'إعادة تعيين كلمة المرور في ChitChat',
            html: `<h2>مرحباً ${user.name}</h2><p>رمز التحقق لإعادة تعيين كلمة المرور هو: <b>${verificationCode}</b></p>`
          });
        } catch (mailErr) {
          console.error("خطأ في إرسال البريد:", mailErr);
        }

        res.json({ message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" });
      }
    );
  });
});

// 5. التحقق من رمز نسيان كلمة المرور
app.post("/verify-forgot-otp", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "البريد الإلكتروني ورمز التحقق مطلوبان" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "المستخدم غير موجود" });
    }

    const user = results[0];

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "رمز التحقق غير صحيح" });
    }

    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
    }

    res.json({ message: "تم التحقق من الرمز بنجاح" });
  });
});

// 6. إعادة تعيين كلمة المرور الجديدة
app.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/;
  if (!strongPasswordRegex.test(newPassword)) {
    return res.status(400).json({
      error: "كلمة المرور ضعيفة يجب أن تحتوي على حرف كبير، حرف صغير، ورمز خاص على الأقل",
    });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "المستخدم غير موجود" });
    }

    const user = results[0];

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "رمز التحقق غير صحيح" });
    }

    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password = ?, verification_code = NULL, code_expires_at = NULL WHERE email = ?",
      [hashedPassword, email],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن" });
      }
    );
  });
});
// ==========================================
// مسار إعادة إرسال رمز التحقق (Resend Code Endpoint)
// ==========================================
app.post("/resend-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "المستخدم غير موجود" });
    }

    const user = results[0];
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق جديدة

    db.query(
      "UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?",
      [newCode, codeExpiresAt, email],
      async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        try {
          await transporter.sendMail({
            from: '"ChitChat App" <chatappchitchat@gmail.com>',
            to: email,
            subject: 'رمز التحقق الجديد الخاص بك في ChitChat',
            html: `<h2>مرحباً ${user.name}</h2><p>رمز التحقق الجديد هو: <b>${newCode}</b></p>`
          });
        } catch (mailErr) {
          console.error("خطأ في إرسال البريد:", mailErr);
          return res.status(500).json({ error: "فشل إرسال البريد الإلكتروني" });
        }

        res.json({ message: "تم إعادة إرسال رمز التحقق بنجاح إلى بريدك" });
      }
    );
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`السيرفر يعمل بنجاح على المنفذ ${PORT}`);
});