const express = require('express')
const router = express.Router()
const userModel = require('../models/user')
const productModel = require('../models/product')
const stripe = require('stripe')('sk_test_51NsLBADMF5rirMzQtW4DwVuFBqz4jhhf2j0m8yoVxbCKdhuxM7Zxx8rcMvtP8FviigPEHF9Y10SqY05giTrUazzU00Nf9RXF5t');

router.post('/checkout',async(req,res)=>{
    const {tokenId,price } = req.body
    try{
    stripe.charges.create(
        {
          amount: price,
          currency: 'usd',
          source: tokenId,
          //description: `Payment for ${product.title}`,
        //   metadta: {
        //     productId: product.id
        //   }
        },
        function(err, charge) {
          if(err) new Error("Payment Failed");
          else {console.log("Payment Success");
          res.send("Payment Success")
        }
        })}
        catch(err){
            console.log(err)
        }   
})
module.exports = router
