// Import required modules and models
const express = require('express');
const router = express.Router();
const categoryModel = require('../models/categories');
const userModel = require('../models/user');
const productModel = require('../models/product');
const uploads = require('../middlewares/productMulter');
const xl = require('excel4node');

// Define the route to add a new product
router.post('/add', uploads.array('images'), async (req, res) => {
  try {
    console.log("RRR", req.body);
    const fileNames = req.files.map((file) => file.filename);
    const {
      name,
      description,
      quantity,
      duration,
      basePrice,
      categoryID,
      ownerID,
    } = req.body;

    const category = await categoryModel.findById(categoryID);
    const owner = await userModel.findById(ownerID);

    if (!category) {
      return res.status(404).json({ error: 'Category not found!' });
    }

    if (!owner) {
      return res.status(404).json({ error: 'Owner not found!' });
    }

    const product = await productModel.create({
      name,
      description,
      quantity,
      duration,
      basePrice,
      currentPrice: basePrice,
      owner: owner,
      category: category,
      images: fileNames, // Save the image file names to the product
      checkout:'false'
    });

    category.products.push(product);
    owner.products.push(product);

    await category.save();
    await owner.save();

    return res.status(200).json({ message: 'Product added successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error adding product!' });
  }
});

//Get all products
router.get('/get/:id', async(req,res)=>{
  const { id } = req.params
  //console.log(id)
  const products = await productModel.find({owner: id , status:'InActive'})
  res.status(200).send(products)
})

//Products for single user
router.get('/table/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Find all products that match the given owner id and have a role of "seller"
    const products = await productModel.find({ owner: id , status:"Finished" , auctionEnded:'true' });
    res.status(200).send(products);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//Total Earning for Seller
router.get('/total/earning/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find all products that match the given owner id and meet the specified criteria
    const products = await productModel.find({
      owner: id,
      status: "Finished",
      auctionEnded: true,
      checkout: false,
    });

    // Calculate the total earnings by summing up the currentPrice of these products
    let totalEarnings = 0;
    products.forEach((prod) => {
      const currentPriceStr = prod.currentPrice.toString(); // Convert to string
     // console.log('Current Price (Before Parsing):', currentPriceStr);
      
      // Parse as a floating-point number
      const currentPriceFloat = parseFloat(currentPriceStr);
      //console.log('Current Price (After Parsing):', currentPriceFloat);
    
      if (!isNaN(currentPriceFloat)) {
        totalEarnings += currentPriceFloat;
      }
    
      //console.log('Total Earnings:', totalEarnings);
    });
    

    // Send the total earnings as a response
    res.status(200).json({ totalEarnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//get live products where auction started is true
router.get('/get-live', async(req,res)=>{
  const products = await productModel.find({auctionEnded:'false' , auctionStarted:'true'})
  res.status(200).send(products)
})

// Find a single product
router.get('/get-single/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    //console.log('Fetched product:', product);

    res.status(200).json(product.toObject());
  } catch (error) {
    //console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//find product of one category
router.get('/category/:id',async(req,res)=>{
  const { id } = req.params
  const products = await productModel.find({category:id, auctionEnded:'false', status:'Active'})
  res.send(products)
})


//update single product
router.post('/update/:id',async(req,res)=>{

  const { id } = req.params
  const { name , basePrice, quantity, description, currentPrice , auctionStarted , auctionEnded} = req.body
  const product = await productModel.findById(id)

  product.name = name;
  product.basePrice = basePrice;
  product.quantity = quantity;
  product.description = description;
  product.currentPrice = currentPrice
  product.auctionStarted = auctionStarted
  product.auctionEnded = auctionEnded

  await product.save()
})

router.put('/update-single/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateFields = {};

    if (req.body.name) {
      updateFields.name = req.body.name;
    }

    if (req.body.basePrice) {
      updateFields.basePrice = req.body.basePrice;
    }

    if (req.body.quantity) {
      updateFields.quantity = req.body.quantity;
    }

    if (req.body.description) {
      updateFields.description = req.body.description;
    }

    if (req.body.currentPrice) {
      updateFields.currentPrice = req.body.currentPrice;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    return res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


//delete a product
router.delete('/delete/:id' , async(req,res)=>{
  const { id } = req.params;
  const product = await productModel.findByIdAndDelete(id)
  res.status(200).send("Item Deleted Successfully")
})

//generate excel file
router.get('/generate-excel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find all finished products that match the given owner id
    const products = await productModel.find({ owner: id, status: "Finished" });

    // Create a new Excel workbook and add a worksheet
    const workbook = new xl.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Define the columns and headers for the Excel file
    const headerStyle = workbook.createStyle({
      font: {
        bold: true,
      },
    });

    worksheet.cell(1, 1).string('Product Name').style(headerStyle);
    worksheet.cell(1, 2).string('Description').style(headerStyle);
    worksheet.cell(1, 3).string('Quantity').style(headerStyle);
    worksheet.cell(1, 4).string('Base Price').style(headerStyle);
    worksheet.cell(1, 5).string('Current Price').style(headerStyle);

    // Add the products data to the worksheet
    products.forEach((product, index) => {
      const rowIndex = index + 2; // Start from the second row

      worksheet.cell(rowIndex, 1).string(product.name);
      worksheet.cell(rowIndex, 2).string(product.description);
      worksheet.cell(rowIndex, 3).number(product.quantity);
      worksheet.cell(rowIndex, 4).number(parseFloat(product.basePrice.toString()));
      worksheet.cell(rowIndex, 5).number(parseFloat(product.currentPrice.toString()));
    });

    // Generate the Excel data into a buffer
    const excelBuffer = await workbook.writeToBuffer();

    // Set the response headers to trigger the download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

    // Write the buffer to the response stream
    res.end(excelBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
