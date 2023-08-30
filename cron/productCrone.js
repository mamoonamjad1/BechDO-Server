const productModel = require("../models/product");
const userModel = require("../models/user");

module.exports.productCrone = async function (io) { // Accept io as an argument
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
      const user = await userModel.findById({ _id: product.bidder, role: 'buyer' });
      console.log("YOLO",user._id)
      // Emit a socket message to the bidder for each product
      io.to(user.socketId).emit("winning", {
        productId: product._id,
        currentPrice: product.currentPrice,
        name: product.name,
        quantity: product.quantity
      });
    }
  } catch (error) {
    console.error(error);
  }
};
