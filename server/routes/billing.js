const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/requireAuth");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// POST /api/billing/create-checkout
// Creates a Stripe checkout session for Pro subscription upgrade
router.post("/create-checkout", requireAuth, async (req, res, next) => {
  if (!stripe) {
    return res.status(503).json({ error: "Billing not configured" });
  }

  const firebaseUid = req.user.uid;

  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.subscriptionTier === "PRO") {
      return res.status(400).json({ error: "Already subscribed to Pro" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.CLIENT_ORIGIN}/browse?upgraded=true`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/browse`,
      metadata: { firebaseUid },
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// GET /api/billing/status
// Returns current user's subscription tier
router.get("/status", requireAuth, async (req, res, next) => {
  const firebaseUid = req.user.uid;
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { subscriptionTier: true, subscriptionEndsAt: true },
    });
    res.json(user ?? { subscriptionTier: "FREE" });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook handler — exported separately so index.js can mount it
// BEFORE express.json() (Stripe requires raw body for signature verification)
const webhookHandler = async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Billing not configured" });

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await prisma.user.update({
          where: { firebaseUid: session.metadata.firebaseUid },
          data: {
            subscriptionTier: "PRO",
            stripeCustomerId: session.customer,
            subscriptionEndsAt: null,
          },
        });
        console.log(`[billing] PRO activated for ${session.metadata.firebaseUid}`);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await prisma.user.update({
          where: { stripeCustomerId: String(sub.customer) },
          data: {
            subscriptionTier: "FREE",
            subscriptionEndsAt: new Date(sub.current_period_end * 1000),
          },
        });
        console.log(`[billing] PRO cancelled for customer ${sub.customer}`);
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

module.exports = router;
module.exports.webhookHandler = webhookHandler;
