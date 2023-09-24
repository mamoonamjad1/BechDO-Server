const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const productModel = require("../models/product");
const notificationModel = require("../models/notification");
const moment = require("moment");
const mongoose = require('mongoose')
const Decimal128 = mongoose.Types.Decimal128;

// const { ObjectId } = require('mongoose').Types;
// let io = require('../bin/www')
// async function updateRemainingTime(productId) {
//   const product = await productModel.findById(productId);

//   if (product.auctionStarted && !product.auctionEnded) {
//     const currentTime = moment();
//     const remainingTime = moment(product.auctionEndTime).diff(
//       currentTime,
//       "seconds"
//     );

//     if (remainingTime <= 0) {
//       // Auction has ended
//       product.auctionStarted = false;
//       product.auctionEnded = true;
//       product.status = "Finished";
//       await product.save();
//       console.log(`Auction on Product ${product.name} has ended`);
//     } else {
//       product.auctionEndTime = moment(currentTime)
//         .add(remainingTime, "seconds")
//         .toDate();
//       await product.save();
//       console.log(
//         `Remaining time for Auction on Product ${product.name}: ${remainingTime} seconds`
//       );
//     }
//   }
// }

// router.post('/start/:id', async (req, res) => {
//   const { id } = req.params;
//   const product = await productModel.findById(id);

//   // const currentTime = moment();

//   // if (!product.auctionStarted) {
//   //   product.auctionStartTime = currentTime.toDate();
//   //   product.auctionEndTime = moment(currentTime).add(product.duration, 'seconds').toDate();

//     product.auctionStarted = true;
//     product.status = 'Active';

//     await product.save();
//     console.log(`Auction on Product ${product.name} started`);

//   //   // Calculate the initial interval based on the remaining time
//   //   const initialRemainingTime = moment(product.auctionEndTime).diff(currentTime, 'seconds');
//   //   const initialInterval = Math.max(initialRemainingTime, 1) * 1000; // Convert seconds to milliseconds

//   //   // Call the updateRemainingTime function every interval
//   //   const interval = setInterval(async () => {
//   //     console.log(`Interval for Product ${product.name}: ${initialInterval} milliseconds`);
//   //     await updateRemainingTime(id);
//   //   }, initialInterval); // Use the calculated interval

//   //   res.status(200).send(`Auction on Product ${product.name} started`);
//   // } else {
//   //   // Calculate the remaining time for the auction in seconds
//   //   const remainingTime = moment(product.auctionEndTime).diff(currentTime, 'seconds');

//   //   if (remainingTime <= 0) {
//   //     product.auctionStarted = false;
//   //     product.auctionEnded = true;
//   //     product.status = 'Finished';

//   //     await product.save();
//   //     clearInterval(interval); // Clear the interval to stop the timer
//   //     console.log(`Auction on Product ${product.name} has ended`);
//   //     res.status(200).send(`Auction on Product ${product.name} has ended`);
//   //   } else {
//   //     // Update the auction end time with the remaining time
//   //     product.auctionEndTime = moment(currentTime).add(remainingTime, 'seconds').toDate();

//   //     await product.save();
//   //     clearInterval(interval); // Clear the interval to stop the timer

//   //     // Calculate the next interval based on the remaining time
//   //     const nextInterval = Math.max(remainingTime, 1) * 1000; // Convert seconds to milliseconds

//   //     // Call the updateRemainingTime function every interval
//   //     const newInterval = setInterval(async () => {
//   //       console.log(`Interval for Product ${product.name}: ${nextInterval} milliseconds`);
//   //       await updateRemainingTime(id);
//   //     }, nextInterval); // Use the calculated interval

//       res.status(200).send(`Auction on Product ${product.name} is already running`);
//     }
//   // }
// );


router.post("/start/:id", async (req, res) => {
  const { id } = req.params;
  console.log("In the route")
  try {
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (product.auctionStarted) {
      return res.status(400).send("Auction has already started");
    }

    let currentTime = moment();

    product.auctionStarted = true;
    product.status = "Active";
    product.auctionStartTime = currentTime.toDate();
    product.auctionEndTime = moment(currentTime)
      .add(product.duration, "seconds")
      .toDate();

    await product.save();
    res.send("Auction Started");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/bid", async (req, res) => {
  try {
    const io = req.io;
    console.log("Bid: ", req.body);
    const { productID, bidderID, currentPrice } = req.body;
    const product = await productModel.findById(productID);
    const bidder = await userModel.findOne({ _id: bidderID, role: "buyer" });
    console.log("PPPP", product);
    const convertedCurrentPrice = Decimal128.fromString(currentPrice);
    console.log("Converted Price", convertedCurrentPrice);

    product.bidder = bidder;
    product.currentPrice = currentPrice;
    console.log("Product Bidder:", product.bidder);

    await product.save();

    // Create a new notification for the bid and save it for each buyer
    const buyers = await userModel.find({ role: "buyer" });
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    buyers.forEach(async (buyer) => {
      // if (buyer._id.toString() !== bidderID) {
        const notification = new notificationModel({
          user: buyer._id, // Save the notification for each buyer
          product: productID,
          detail: `User:${bidder.firstName} placed Bid of ${product.currentPrice} on ${product.name}`,
          createdAt:date
        });
        await notification.save();
        
        io.emit('sendNotification', {
          detail: `User:${bidder.firstName} placed Bid of ${product.currentPrice} on ${product.name}`,
        });
      // }
    });
    res.status(200).send(currentPrice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;