module.exports = (req, res, next) => {
	if (req.user.role === 0) {
		return res.status(401).json({ error: "Not an admin" });
	}
	next();
};
