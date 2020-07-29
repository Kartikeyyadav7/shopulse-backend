const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	// get the token from the header
	const token = req.headers["x-access-token"] || req.headers["authorization"];
	if (!token) {
		return res.status(400).json({ errors: "No tokens found" });
	}
	try {
		jwt.verify(token, process.env.SECRET, (err, decoded) => {
			if (err) {
				return res.status(401).json({ errors: "Invalid token found" });
			} else {
				req.user = decoded.user;
			}
			next();
		});
	} catch (err) {
		res.status(400).json({ errors: "Some internal server error" });
	}
};
