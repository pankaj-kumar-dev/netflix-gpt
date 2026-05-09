const prisma = require("../lib/prisma");

// Checks if the authenticated user has a PRO subscription.
// Skipped entirely if STRIPE_PRO_PRICE_ID is not set (dev mode — all users pass).
const requirePro = async (req, res, next) => {
  if (!process.env.STRIPE_PRO_PRICE_ID) {
    return next(); // Stripe not configured — skip gate in dev
  }

  const firebaseUid = req.user?.uid;
  if (!firebaseUid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { subscriptionTier: true },
    });

    if (user?.subscriptionTier !== "PRO") {
      return res.status(403).json({
        error: "Pro subscription required",
        code: "UPGRADE_REQUIRED",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requirePro;
