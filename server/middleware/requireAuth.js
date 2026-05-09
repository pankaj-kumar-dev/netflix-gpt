const admin = require("firebase-admin");

// Initialize Firebase Admin if service account key is provided
// To activate: base64-encode your Firebase service account JSON and set FIREBASE_SERVICE_ACCOUNT_KEY
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf8")
    );
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("Firebase Admin initialized — tokens will be cryptographically verified");
  } catch (err) {
    console.error("Firebase Admin init failed:", err.message);
  }
}

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header required" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (admin.apps.length) {
      // Production path: cryptographic signature verification
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = { uid: decoded.uid, email: decoded.email };
    } else {
      // Dev fallback: decode JWT payload without signature verification
      // WARNING: not secure — activate FIREBASE_SERVICE_ACCOUNT_KEY for production
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf8")
      );
      const uid = payload.user_id || payload.sub;
      if (!uid) throw new Error("UID not found in token");
      req.user = { uid, email: payload.email };
      console.warn("⚠️  requireAuth: dev mode — no signature verification");
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = requireAuth;
