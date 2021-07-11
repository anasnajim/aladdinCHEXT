module.exports = (sequelize, Sequelize) => {
	const UserContact = sequelize.define("user_contacts", {
		user_id: {
			type: Sequelize.INTEGER
		},
		contact_id: {
			type: Sequelize.BIGINT
		}
	});

	return UserContact;
};