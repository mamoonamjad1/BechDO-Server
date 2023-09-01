const express =  require('express')
const router = express.Router()
const categoryModel = require('../models/categories')
const upload = require('../middlewares/multer')
const {io} = require("../app")

router.post('/add', upload.single('image'),async(req,res)=>{

    console.log("Category: ",req.body)
    const {name , image, description} = req.body;
    const url=req.protocol + '://' + req.get('host');
    try{
        const category = await categoryModel.create({
            name,
            image:url+'/images/'+req.file.filename,
            description,
     
         })
         res.status(200).send("Category Added")
    }
    catch{
        res.status(400).send("Error Adding Category")
    }

})

router.get('/get', async(req,res)=>{
    console.log("INSIDE")
    const categories = await categoryModel.find()

io.of("/abc").emit("message",{data:"here we"})

    res.status(200).send(categories)
})

module.exports = router