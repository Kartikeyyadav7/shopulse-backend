const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		cart: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Cart",
		},
		price: {
			type: "Number",
			required: true,
		},
		update: {
			type: Date,
			default: Date.now(),
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
