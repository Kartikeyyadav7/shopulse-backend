const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Cart = require("../models/cart");
const Product = require("../models/product");

// @route  POST api/cart/add
// @desc   This addes product to cart
// @access Private

router.post("/add", auth, async (req, res) => {
	const { product, quantity, price, image, name } = req.body;
	const userId = req.user.id;
	try {
		let cart = await Cart.findOne({ user: userId });
		if (cart) {
			let updatedCart = await Cart.updateOne(
				{ user: userId },
				{
					$push: { products: { product, quantity, price, name, image } },
				}
			);
			return res.json({ msg: "Product addded to cart" });
		} else {
			const newCart = new Cart({
				user: userId,
				products: [
					{
						product: product,
						quantity: quantity,
						name: name,
						image: image,
						price: price,
					},
				],
			});

			newCart.save();
			return res.json({ msg: "Product added to cart" });
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({ errors: "Error has occured" });
	}
});

// @route  GET api/cart/all
// @desc   This gives all the products in the cart
// @access Private

router.get("/all", auth, async (req, res) => {
	try {
		const cartDetails = await Cart.findOne({ user: req.user.id });
		if (!cartDetails) {
			return res.status(401).json({ error: "Empty Cart" });
		}
		res.json(cartDetails);
	} catch (err) {
		res.status(500).json({ errors: "Internal server error" });
	}
});

// @route  GET api/cart/:cartId
// @desc   This gives all the cart
// @access Private

router.get("/:cartId", auth, async (req, res) => {
	try {
		const cart = await Cart.findById(req.params.cartId);
		if (!cart) {
			return res.status(404).json({ error: "No cart found" });
		}
		res.json(cart);
	} catch (err) {
		res.status(500).json({ error: "Internal server error" });
	}
});

// @route  DELETE api/cart/delete/cart/
// @desc   This deletes the cart of the user
// @access Private

router.delete("/delete/cart", auth, async (req, res) => {
	try {
		const userId = req.user.id;

		const deletedCart = await Cart.findOneAndDelete({ user: userId });
		if (!deletedCart) {
			return res.status(404).json({ errors: "No cart found to delete" });
		}
		res.json({ msg: "Cart Deleted" });
	} catch (err) {
		res.status(500).json({ errors: "Internal server error" });
	}
});

// @route  DELETE api/cart/delete/product/:prodictId
// @desc   This deletes the particular product in the cart
// @access Private

router.delete("/delete/product/:productId", auth, async (req, res) => {
	try {
		const product = { product: req.params.productId };
		const userId = req.user.id;
		const result = await Cart.updateOne(
			{ user: userId },
			{
				$pull: { products: product },
			}
		);
		if (!result) {
			return res.status(401).json({ errors: "No such product found" });
		}
		res.json({ msg: "Product Deleted" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ errors: "Internal server error" });
	}
});
module.exports = router;
