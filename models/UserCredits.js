module.exports = (sequelize, Sequelize) => {
	const UserCredits = sequelize.define("user_credits", {
		user_id: {
			type: Sequelize.INTEGER
		},
		credits: {
			type: Sequelize.INTEGER
		},
		used_credits: {
			type: Sequelize.INTEGER
		},
        credit_type: {
            type: Sequelize.STRING
        }
	});

	return UserCredits;
};