const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// @route  GET api/user/test
// @desc   This is test route
// @access Public

router.get("/test", (req, res) => {
	res.json({ msg: "hello there" });
});

// @route  POST api/user/signup
// @desc   This is a signup route
// @access Public

router.post(
	"/signup",
	[
		check("name", "Please enter a name").not().isEmpty(),
		check("email", "Please enter a valid email").isEmail(),
		check(
			"password",
			"Please enter a password of length of 6 character or more"
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const { name, lastName, email, password } = req.body;

		try {
			let user = await User.findOne({ email });
			if (user) {
				return res.status(400).json({ errors: "Email already exists" });
			}
			user = new User({
				name,
				lastName,
				email,
				password,
			});
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			await user.save();

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				process.env.SECRET,
				{ expiresIn: "7 days" },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			res.status(500).json({ errors: "Server Error" });
		}
	}
);

// @route  POST api/user/login
// @desc   This is a login route
// @access Public

router.post(
	"/login",
	[
		check("email", "Please enter a valid email").isEmail(),
		check("password", "Enter a password").exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;
		try {
			let user = await User.findOne({ email });
			if (!user) {
				return res.status(401).json({ errors: "Invalid credentials" });
			}
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({ errors: "Wrong password" });
			}
			const payload = {
				user: {
					id: user.id,
					role: user.role,
				},
			};
			jwt.sign(
				payload,
				process.env.SECRET,
				{ expiresIn: "5 days" },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			res.status(500).json({ errors: "Server error , sorry :(" });
		}
	}
);

// @route  GET api/user/all
// @desc   This gives me all the users
// @access Public

router.get("/all", async (req, res) => {
	try {
		const users = await User.find();
		if (!users) res.status(404).json({ error: "No users found" });
		res.json({ users });
	} catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
});

// @route  GET api/user/:userid
// @desc   This gives me the particular user
// @access Public

router.get("/:userid", async (req, res) => {
	try {
		const user = await User.findById(req.params.userid);
		if (!user) res.status(404).json({ error: "No user found" });
		res.json({ user });
	} catch (err) {
		res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
