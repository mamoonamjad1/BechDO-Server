const express = require("express");
const router = express.Router();
const productModel = require("../models/product");
const notificationModel = require("../models/notification");
const userModel =  require("../models/user");
router.get('/get', async (req, res) => {
    const products = await productModel.find({status:'InActive'}).populate('owner')
    res.send(products)
})

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await productModel.findByIdAndDelete(id)
    res.send("Deleted")
})

router.get('/get-live', async(req,res)=>{
    const products = await productModel.find({auctionEnded:'false' , auctionStarted:'true'})
    .populate('owner')
    .populate('bidder')
    res.status(200).send(products)
  })

router.get('/details/:id', async (req, res) => {
    const { id } = req.params;
    const details = await notificationModel.find({product:id})
    res.send(details)
})
router.get('/bids', async (req, res) => {
    
    const details = await notificationModel.find()
    res.send(details)
})

router.get('/chart',async(req,res)=>{
    const products = await productModel.find({auctionEnded:'true'})
    .populate('category')
    res.status(200).send(products)
  });

//Total Earnings for All Sellers with Details
router.get('/total/earnings', async (req, res) => {
    try {
      // Find all products that meet the specified criteria
      const products = await productModel.find({
        status: "Finished",
        auctionEnded: true,
        checkout: false,
      });
  
      // Create an object to store earnings and seller details for each seller
      const earningsAndDetailsBySeller = {};
  
      // Calculate earnings for each seller
      for (const prod of products) {
        const sellerId = prod.owner.toString(); // Convert owner ObjectId to string
        const currentPriceStr = prod.currentPrice.toString(); // Convert currentPrice to string
  
        // Parse currentPrice as a floating-point number
        const currentPriceFloat = parseFloat(currentPriceStr);
  
        if (!isNaN(currentPriceFloat)) {
          // If the seller is already in the earningsAndDetailsBySeller object, add to their earnings
          if (earningsAndDetailsBySeller.hasOwnProperty(sellerId)) {
            earningsAndDetailsBySeller[sellerId].totalEarnings += currentPriceFloat;
          } else {
            // If the seller is not in the object, initialize their earnings and fetch their details
            const seller = await userModel.findById(sellerId);
  
            if (seller) {
              earningsAndDetailsBySeller[sellerId] = {
                totalEarnings: currentPriceFloat,
                sellerDetails: seller.toObject(), // Convert seller details to a plain object
              };
            }
          }
        }
      }
  
      // Send the earningsAndDetailsBySeller object as a response
      res.status(200).json(earningsAndDetailsBySeller);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });




//   router.get('/details/line-chart', async (req, res) => {
//     const details = await notificationModel.find().populate('product')
//     res.send(details)
// })
  
module.exports = router;