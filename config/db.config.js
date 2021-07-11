
module.exports = {
	HOST: process.env.DB_HOST,
	USER: process.env.DB_USER,
	PASSWORD: process.env.DB_PASS,
	DB: process.env.DB_NAME,
	dialect: process.env.DB_TYPE,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	ssl: true,
	dialectOptions: {
		ssl: true
	}
};