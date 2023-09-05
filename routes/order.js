const express = require("express");
const router = express.Router();
const orderModel = require("../models/order");
const userModel = require("../models/user");
const productModel = require("../models/product");
const nodemailer = require('nodemailer');

router.get("/get/:id", async (req, res) => {
  const { id } = req.params;
  console.log("USER ID:", id);
  try {
    // Find orders where the buyer is 'id' and the status is 'UnPaid'
    const orders = await orderModel
      .find({ buyer: id, status: "UnPaid" })
      .populate("products");
    res.status(200).send(orders);
  } catch (error) {
    // Handle any errors, e.g., database errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/address/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, address, city, postalCode } = req.body;
  
  try {
    // Find all orders where the buyer is 'id' and the status is 'UnPaid'
    const orders = await orderModel.find({ buyer: id, status: "UnPaid" });

    // Use Promise.all to update all orders concurrently
    const updatePromises = orders.map(async (order) => {
      await orderModel.findByIdAndUpdate(order._id, {
        $set: {
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          email: email,
          address: address,
          city: city,
          postalCode: postalCode,
        },
      });
    });

    await Promise.all(updatePromises);

    res.status(200).send("Address updated for all orders");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete an order by ID
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = await orderModel.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(204).send(); // No content after successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get a specific order by ID
router.get("/single/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/delivery/:id",async(req,res)=>{
const {id } = req.params
console.log(id)
  const orders =  await orderModel.find({seller:id, status:'Paid'})
  .populate('products')
  console.log(orders)
  res.status(200).send(orders)

})

// Define a route to update the order status and send an email
router.post('/update-status/:id', async (req, res) => {

  const { id } = req.params;
  const { status } = req.body; // Assuming you send the new status in the request body
  console.log("Order ID",id)
  console.log("Status",status)
  try {
    //Find the order by its ID
    const order = await orderModel.findById(id).populate('buyer').populate('seller').populate('products');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    order.deliveryStatus = status;

    // Save the updated order
    await order.save();
let testAccount = await nodemailer.createTestAccount();
    // Send an email to the buyer
    // const transporter = nodemailer.createTransport({
    //   // Configure your email service here (e.g., Gmail, SMTP server)
    //   service: 'Gmail',
    //   // auth: {
    //   //   type: "OAUTH2",
    //   //   user: "admin@altcabs.com",
    //   //   serviceClient: "104350620386538614175",
    //   //   privateKey:
    //   //     "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrQ8wh9/onYtj+\n9aXlEBWM0TypYs3cThtxfT8XPF6P+BLoXvXQX/VWaEiPlXy/OtidgKBLa1g1MVH1\nkxu7ySGZFhRqECiuseuBLRJLeEo9rncDWT7CSpu7ktJr5MZFHCzct2W/Q2cjKBW1\n5/7CYPqK9lnfKB/JI53Ksw2nld51zMPMFWsD07RbEyeK4Fi5tQHoPIUyfqNvNoS+\n+xtvigSSX+3Ikgap/JSWWJi+pCOFlgPWsEET9fLWgzYoCZ3RY1TuzzHZATn99D92\ntfZ73hwWBoaLm2jG95vfIeO1f4//3pWdb4b7N4iXdxTLEPV3YRlqytzduGTkosUY\nebXRtGcbAgMBAAECggEACjUWO4gODr7jc/6sDoTw492soePTpSe6lv8B/Z6JfEcq\nyVKvj+XIN4grmvMr5jHZqzl5VEVnknQIEHzeEEkiiX85ZEDmS9Mq2B4ZkwnuUtLN\nIRP2m5nawkkz5V5TOtc9DUKY+9dGlF/VO2xCUM9630FjhdtcWZ6Xzvbw/2X9RkP+\nyG/ZQ4wKDY1jrcVr8i1VQaR377JKqVx2btMGZwuaKCudEZ6v1hJSihLlmA3mCrob\nFVZZWMgIwiVfa4VnYrVad9GkYUh3J2i3Ri8iHcuwPu5Pf9l8SEjpswBLE1GtCY/I\nelZAiMBVa5OuO8O/IwaZmpwL3Q1uV52xtHsUbr2k0QKBgQDxjuX3z70xVdPNOvx7\n462L9WOeLqITht6XBVDdnfP7ifl6IACOftJgM+f06/sk7+66R4s7nk2gae/cx+Qe\nHYBw/0nDZq6KpnXMyO48zwaIH5KmZSp5RR6x5I8hnjm7Q2/G2LKZvx+CXPriAAHR\ntJe6FpSoH7qAjWswDRQ8Rh6QnQKBgQC1gQspDTPmZ/zQeHPwQyKhqmC6svhT5UFD\n5E05nphyb7TjQhRSwtCBbw+H+LTqno6oGshNes9qAbyJbGn+lMWVFFj7ba4E8gvW\nw+fzjUO3ceTWs65nVGpIfk8/KsEnf207bSDiShAEZjGgSBxzaDow+nHRDI4eu+Js\nqQjfRoA9FwKBgBdeP5kNm7veFbNQ9YP2rp9PieePk1ZYQchSV1RZJ3U6D8xktCkU\n071CyDnFanJUU7/pk+qckd3m4bF2FPdk2zwTNkuU72WyXMsG1SVE0djxVPqL5uP8\nb8+90Krr56HaEEIoTH7bIm02GX8riQGEevkhnhf1mdE93RS07zQ1hFdxAoGAHkmC\nSz9gwbnofgEbl6QcS03bBkyHE7jVwzZ9jHfiiHYLgUCtk4HeuTqHJPFjfyMmOvb9\nJbCwm8feZjApH8pDjjTvBEWxHDInt5bJReL0wc/Hl+wz1hpIAgDRyICh6q1g1OHI\n8vnY4mMLNOvTk45452NjSrcFoCtKBUfPqzJgg9ECgYAM+JeJz6ek90fORuvFQQAi\nYD+/gQP8WMuAF3T6qGgCKT/DzGVIgxp5WxTzZr//CV8J1k2GMrh6+FKIhRA2LiiH\nhPeKGvNW3oWs2Y0U24bbErQULO2cSL4FHN0vl+l0nNUdbbwUdxsaVnXHIH1PQpyz\npaXPHUh6F6Q7OSkM+cYZoQ==\n-----END PRIVATE KEY-----\n",
    //   // },
    // });

    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass  // generated ethereal password
      }
  });

    const mailOptions = {
      from: `${order.seller.email}`, // Sender's email address
      to: `mamoon.amjad17@gmail.com`, // Buyer's email address (use order.email or the appropriate field)
      subject: 'Order Status Update',
      text: `The Status for yout order of ${order.products.name} has been updated to ${status}.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Order status updated and email sent' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
