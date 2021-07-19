module.exports = (sequelize, Sequelize) => {
	const UserReferral = sequelize.define("user_referrals", {
		user_id: {
			type: Sequelize.INTEGER
		},
        referral_email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isEmail: {
                    msg: "Invalid email address!"
                },
                notNull: {
                    msg: "Invalid email address!"
                },
                notEmpty: true
            }
        },
        referral_code: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
	});
	
	return UserReferral;
};