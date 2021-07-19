module.exports = (sequelize, Sequelize) => {
	const UserAccessType = sequelize.define("user_access_types", {
		access_type: {
			type: Sequelize.INTEGER
		},
		access_desc: {
			type: Sequelize.STRING
		}
	});
	
	return UserAccessType;
};