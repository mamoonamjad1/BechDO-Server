const c = require("config");
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51NsLBADMF5rirMzQtW4DwVuFBqz4jhhf2j0m8yoVxbCKdhuxM7Zxx8rcMvtP8FviigPEHF9Y10SqY05giTrUazzU00Nf9RXF5t"
);
const userModel = require("../models/user");

router.post("/make", async (req, res) => {
  console.log("Request:", req.body);
  const { tokenId, price } = req.body;
  console.log("Price", price);
  const value = price * 100;
  try {
    stripe.charges.create(
      {
        amount: value,
        currency: "gbp",
        source: tokenId,
        //description: `Payment for ${product.title}`,
        //   metadta: {
        //     productId: product.id
        //   }
      },
      function (err, charge) {
        if (err) {
          new Error("Payment Failed");
          console.log("Error", err);
        } else {
          console.log("Payment Success");
          res.send("Payment Success");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

router.post("/seller-payment/:id", async (req, res) => {
  const userId = req.params.id;
  const {amount} = req.body;
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.accountId) {
            // The user does not have a Stripe Connect account, so create one
            const account = await stripe.accounts.create({
              type: "express",
            });
            user.accountId = account.id;
            await user.save();
      
            const accountLink = await stripe.accountLinks.create({
              account: account.id,
              refresh_url: "http://localhost:3000/seller/pages/dashboard",
              return_url: "http://localhost:3000/seller/pages/dashboard",
              type: "account_onboarding",
            });
      
            res.send(accountLink.url);
          
    } else {
      
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount*0.85*100),
        currency: "gbp",
        destination: user.accountId,
      });
      res.send("Success");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the payment or connecting to Stripe.");
  }
});



module.exports = router;
