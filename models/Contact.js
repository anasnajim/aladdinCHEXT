module.exports = (sequelize, Sequelize) => {
	const Contact = sequelize.define("contacts", {
		company: {
			type: Sequelize.STRING
		},
		firstname: {
			type: Sequelize.STRING
		},
		lastname: {
			type: Sequelize.STRING
		},
		left_company: {
			type: Sequelize.STRING
		},
		in_url: {
			type: Sequelize.STRING
		},
		position: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING
		},
		phone: {
			type: Sequelize.STRING
		},
		tel: {
			type: Sequelize.STRING
		},
		company_site: {
			type: Sequelize.STRING
		},
		about: {
			type: Sequelize.TEXT
		},
		num_employee: {
			type: Sequelize.STRING
		},
		industry_tags: {
			type: Sequelize.TEXT
		},
		founded: {
			type: Sequelize.STRING
		},
		hq: {
			type: Sequelize.STRING
		},
		country: {
			type: Sequelize.STRING
		},
		social_fb: {
			type: Sequelize.STRING
		},
		social_in: {
			type: Sequelize.STRING
		},
		social_ig: {
			type: Sequelize.STRING
		},
		social_tw: {
			type: Sequelize.STRING
		}
	});

	return Contact;
};