const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
	{
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "product",
				},
				image: {
					type: String,
					required: true,
				},
				name: {
					type: String,
					required: true,
				},
				quantity: {
					type: String,
					default: "1",
				},
				price: {
					type: Number,
				},
			},
		],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		modifiedOn: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
