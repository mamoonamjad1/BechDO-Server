const productModel = require("../models/product");

module.exports.productCrone = async function () {
  try {
    const currentTime = new Date();

    const result = await productModel.updateMany(
      {
        auctionEnded: 'false',
        auctionStarted: 'true',
        status: 'Active',
        auctionEndTime: { $lte: currentTime },
      },
      {
        $set: {
          status: 'Finished',
          auctionEnded:true,
          auctionStarted:false,
        }
      }
    );

    // if (result.nModified > 0) {
    //   console.log(`Modified ${result.nModified} products`);
    // } else {
    //   console.log("No Product to Modify");
    // }

  } catch (error) {
    console.error(error);
  }
};
