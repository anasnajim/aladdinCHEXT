module.exports = (sequelize, Sequelize) => {
	const UserUsages = sequelize.define("user_usages", {
		user_id: {
			type: Sequelize.INTEGER
		},
		week_usage: {
			type: Sequelize.INTEGER
		}
	});

	return UserUsages;
};