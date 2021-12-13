const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const user = require("./routes/user");
const product = require("./routes/product");
const cart = require("./routes/cart");
const order = require("./routes/order");
 
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@shopulse-1-dozvf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		}
	)
	.then(() => {
		console.log("DB Connected");
	})
	.catch((err) => console.log(err));

app.get("/", (req, res) => {
	res.send("Welcome to the backend ");
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", user);
app.use("/api/product", product);
app.use("/api/cart", cart);
app.use("/api/order", order);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server is running on ${PORT}`);
});
