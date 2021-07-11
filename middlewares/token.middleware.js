const jwt = require('jsonwebtoken');

// Token authentication middleware
exports.authenticateToken = (req, res, next) => {

	const token = req.headers['auth-token'];

	if (!token) return res.status(401).send({ message: "Data Access Denied!" });

	jwt.verify(token, process.env.APP_TOKEN_SECRET, function (err, decoded) {
		if (err) return res.status(400).send({ message: "Invalid Token!" });

		req.user_id = decoded._id;
		next();
	});
};