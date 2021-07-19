const fs = require('fs');

module.exports = {
	HOST: process.env.DB_HOST,
	USER: process.env.DB_USER,
	PASSWORD: process.env.DB_PASS,
	DB: process.env.DB_NAME,
	dialect: process.env.DB_TYPE,
	pool: {
		max: 5,
		min: 0,
		acquire: 60000,
		idle: 30000
	},
	// SSL requirement disabled - no need for this
	// dialectOptions: {
	// 	ssl: {
	// 		ca: fs.readFileSync('./certs/ssl_aladdin_db.pem')
	// 	}
	// }
};