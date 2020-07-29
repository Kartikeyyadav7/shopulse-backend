const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Product = require("../models/product");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: "dhc7nkut3",
	api_key: "863235225638562",
	api_secret: "ddFyJz-BqNV1qGWlcLEFPPXJPy0",
});

// cloud_name: process.env.CLOUD_NAME,
// api_key: process.env.API_KEY,
// api_secret: process.env.API_SECRET,

// defining how files to be stored
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/");
	},
	filename: (req, file, cb) => {
		const now = new Date().toISOString();
		const date = now.replace(/:/g, "-");
		cb(null, date + file.originalname);
	},
});

// TO accept a certain format of file type
const fileFormat = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(new Error("Input proper file format"), false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 3,
	},
	fileFilter: fileFormat,
});

// @route  GET api/product/test
// @desc   This is a test route
// @access Private

router.get("/test", auth, role, (req, res) => {
	res.json(req.user);
});

// @route  POST api/product/addproduct
// @desc   This is to add products by admin
// @access Private

router.post(
	"/addproduct",
	auth,
	role,
	upload.single("productImage"),
	async (req, res) => {
		try {
			const result = await cloudinary.uploader.upload(req.file.path);
			const newProduct = new Product({
				name: req.body.name,
				description: req.body.description,
				price: req.body.price,
				productImage: result.secure_url,
			});

			const productDetails = await newProduct.save();
			res.json(productDetails);
		} catch (err) {
			console.error(err);
			res.status(500).json({ errors: "Server Error" });
		}
	}
);

// @route  GET api/product/all
// @desc   This is to get all the products
// @access Public

router.get("/all", async (req, res) => {
	try {
		const products = await Product.find();
		if (!products) {
			return res.status(404).json({ errors: "No products found" });
		}
		res.json(products);
	} catch (err) {
		res.status(500).json({ error: "Internal server error" });
	}
});

// @route  GET api/product/:productid
// @desc   This is to get the product from productid
// @access Private

router.get("/:productid", auth, async (req, res) => {
	const product = await Product.findById(req.params.productid);
	try {
		if (!product) {
			return res.status(404).json({ error: "No as such product found" });
		}
		res.json(product);
	} catch (err) {
		res.status(500).json({ errors: "Internal Server error" });
	}
});

// @route  DELETE api/product/delete/:productid
// @desc   This is to delete the product throught productid
// @access Private

router.delete("/:productid", auth, role, async (req, res) => {
	try {
		const deletedProduct = await Product.findByIdAndRemove(
			req.params.productid
		);
		if (!deletedProduct) {
			return res.status(404).json({ error: "No product found to delete" });
		}
		res.json(deletedProduct);
	} catch (err) {
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
