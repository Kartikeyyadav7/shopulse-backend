const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Order = require("../models/order");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_KEY);

// @route  POST api/order/payment
// @desc   This makes payment for the app
// @access Private

router.post("/payment", auth, (req, res) => {
	const { token, paymentAmount } = req.body;
	const idempotencyKey = uuidv4();

	return stripe.customers
		.create({
			email: token.email,
			source: token.id,
		})
		.then((customer) => {
			stripe.charges.create(
				{
					amount: paymentAmount * 100,
					receipt_email: token.email,
					currency: "inr",
					customer: customer.id,
					description: "Purchase is on going",
				},
				{ idempotencyKey }
			);
		})
		.then((result) =>
			res.status(200).json({ errors: [{ msg: "payment successfull" }] })
		)
		.catch((err) =>
			res
				.status(500)
				.json({ errors: [{ msg: "Internal server error please try again" }] })
		);
});

// @route  POST api/order/add
// @desc   This gives take orders
// @access Private

router.post("/add", auth, async (req, res) => {
	const { cart, price } = req.body;
	const userId = req.user.id;
	try {
		let order = await Order.findOne({ user: userId });
		if (order) {
			let updatedOrder = await Cart.updateOne(
				{ user: userId },
				{
					$push: { cart },
				}
			);
			return res.json({ msg: "Order Done" });
		} else {
			const newOrder = new Order({
				user: userId,
				cart: cart,
				price: price,
			});

			newOrder.save();
			return res.json({ msg: "Order done" });
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({ errors: "Error has occured" });
	}
});

// @route  POST api/order/getOrders
// @desc   This gives take orders
// @access Private

router.get("/getOrder", auth, async (req, res) => {
	try {
		const orderDetails = await Order.findOne({ user: req.user.id });
		if (!orderDetails) {
			return res.status(401).json({ error: "Empty Order" });
		}
		res.json(orderDetails);
	} catch (err) {
		res.status(500).json({ errors: "Internal server error" });
	}
});
module.exports = router;
