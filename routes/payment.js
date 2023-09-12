const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/make", async (req, res) => {
  const { paymentMethodType, currency } = req.body;
  console.log(req.body);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999, // The amount should be specified in cents (e.g., $19.99 is 1999 cents).
      currency: currency,
      payment_method_types: [paymentMethodType],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
