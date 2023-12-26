const productModel = require("../models/product");
const userModel = require("../models/user");
const io = require("../server").io
const orderModel = require('../models/order')
const notificationModel = require('../models/notification')
const moment = require('moment')

module.exports.productCrone = async function () { 
  const date = moment().format('YYYY-MM-DD HH:mm:ss');
  try {
    const currentTime = new Date();

    const productsToUpdate = await productModel.find({
      auctionEnded: false,
      auctionStarted: true,
      status: 'Active',
      auctionEndTime: { $lte: currentTime },
    });

    for (const product of productsToUpdate) {
      // Update the product's status
      await productModel.findByIdAndUpdate(product._id, {
        $set: {
          status: 'Finished',
          auctionEnded: true,
          auctionStarted: false,
        }
      });

      // Find the bidder's user ID
      let user = await userModel.findById({ _id: product.bidder, role: 'buyer' });
      console.log("YOLO",user._id)
      
    
      user = JSON.parse(JSON.stringify(user))

    io.of("/win").to(user?._id).emit("message",
    {
      productId: product._id,
      currentPrice: product.currentPrice,
      name: product.name,
      quantity: product.quantity,

    })
    const notification = notificationModel.create({
      user: user._id,
      product:product._id,
      detail: `Congratulations on Wining the Bid For Product ${product.name}`,
      createdAt:date
    })

    const order = await orderModel.create({
      seller:product.owner,
      buyer:product.bidder,
      products:product,
    })
    }
  } catch (error) {
    console.error(error);
  }
};
