const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        user_email: {
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
        user_password: {
            type: Sequelize.STRING(1024),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Invalid user password!"
                },
                notEmpty: {
                    msg: "User password required!"
                },
                len: {
                    args: [8, 1024],
                    msg: "Invalid password! Minimum 8 characters!"
                }
            }
        },
        user_firstname: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Invalid user first name!"
                },
                notEmpty: true,
                len: {
                    args: [1, 255],
                    msg: "User first name too long!"
                }
            },
            msg: "User first name required!"
        },
        user_lastname: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Invalid user last name!"
                },
                notEmpty: true,
                len: {
                    args: [1, 255],
                    msg: "User last name too long!"
                }
            },
            msg: "User last name required!"
        },
        user_department: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Invalid user department!"
                },
                isInt: {
                    msg: "Invalid user department!"
                }
            },
            msg: "User department required!"
        }
    },{
        hooks: {
            beforeCreate: async (user, options) => {
                const salt = await bcrypt.genSalt(10);
                user.user_password = await bcrypt.hash(user.user_password, salt);
            },
            afterCreate: async(user, options) => {
                user.user_password = "<encrypted>";
            }
        }
    });

    return User;
};