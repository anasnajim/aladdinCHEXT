const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const models = require("../models");
const User = models.user;
const Department = models.departments;
const UserCredits = models.user_credits;
const UserReferral = models.user_referrals;
const UserUsages = models.user_usages;

const Op = models.Sequelize.Op;

let _this = this;

exports.validation_message = (err) => {
    err_list = err.message.split(",\n");
    if (Array.isArray(err_list)) {
        err_specific = err_list[0].split(": ");
        return err_specific[1];
    }
    return err.message;
};

// register/signup User
exports.register = async (req, res) => {
    try {
        const user = {
            user_email: req.body.user_email,
            user_password: req.body.user_password,
            user_firstname: req.body.user_firstname,
            user_lastname: req.body.user_lastname,
            user_department: req.body.user_department
        };

        const refer_code = req.body.refer_code;

        const valid_user = await User.findOne({ where: { user_email: user.user_email } });
        if (valid_user === null) {
            const new_user = await User.create(user);
            if (!new_user) {
                res.status(400).send({
                    message:
                        _this.validation_message(err) || "Error user registration!"
                });
            }

            // check referral
            if(refer_code){
                let ref_source = await UserReferral.findOne({ where: 
                    { 
                        referral_code: refer_code, 
                        referral_email: new_user.user_email 
                    }
                });

                let ref_source_user = await User.findOne({ where: { id : ref_source.user_id } });

                if(ref_source && ref_source_user){

                    const user_ref_credits = {
                        user_id: ref_source_user.id,
                        credits: process.env.MAX_ADD_REFERRAL,
                        used_credits: 0,
                        credit_type: 'referral'
                    };

                    await UserCredits.create(user_ref_credits);
                }
            }

            const user_trial_credits = {
                user_id: new_user.id,
                credits: process.env.MAX_ADD_TRIAL,
                used_credits: 0,
                credit_type: 'trial'
            };

            await UserCredits.create(user_trial_credits);

            await UserUsages.create({
                user_id: new_user.id,
                week_usage: 0
            });

            const msg = {
                to: new_user.user_email,
                from: process.env.SENDGRID_MAIL_PORTAL,
                subject: process.env.ALADDINB2B_SIGNUP_SUBJ,
                text: `Dear ${user.user_firstname} ${user.user_lastname}, You are now registered to AladdinB2B portal. We have added 12 free wishes to your account for your one month trial. Thank you and happy matching! AladdinB2B`,
                html: `Dear ${user.user_firstname} ${user.user_lastname},<br/><br/>You are now registered to AladdinB2B Portal.<br/><br/>We have added 12 free wishes to your account for your one month trial<br/><br/><br/>Thank you and happy matching!<br/>AladdinB2B`,
            };

            sgMail
            .send(msg)
            .then( (response) => {
                if(response[0].statusCode === 202){

                    res.send({
                        user_id: new_user.id,
                        user_firstname: new_user.user_firstname,
                        user_lastname: new_user.user_lastname
                    });

                }else{
                    res.status(500).send({
                        message:
                            err.message || "Error user registration!"
                    });
                }   
            })
            .catch((error) => {
                console.error(error)
            });

        } else {
            res.status(400).send({
                message: "User email address already registered!"
            });
            return;
        }
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error user registration!"
        });
    }
};

// login User
exports.login = async (req, res) => {
    try {
        if (!req.body.user_email) {
            res.status(400).send({
                message: "User email address required!"
            });
            return;
        }

        if (!req.body.user_password) {
            res.status(400).send({
                message: "User password required!"
            });
            return;
        }

        const user = {
            user_email: req.body.user_email,
            user_password: req.body.user_password
        };

        const valid_user = await User.findOne({ where: { user_email: user.user_email } });
        if (valid_user === null || !valid_user) {
            res.status(400).send({ message: "Invalid email or password!" }); return;
        }

        console.log(valid_user.user_password);

        const valid_pass = await bcrypt.compare(user.user_password, valid_user.user_password);
        if (!valid_pass) {
            res.status(400).send({ message: "Invalid email or password!" }); return;
        }

        const token = jwt.sign({ _id: valid_user.id }, process.env.APP_TOKEN_SECRET, { expiresIn: process.env.APP_TOKEN_EXPIRY });
        res.header('auth-token', token).send({
            accessToken: token, userInfo: {
                user_email: valid_user.user_email,
                user_firstname: valid_user.user_firstname,
                user_lastname: valid_user.user_lastname,
                user_department: valid_user.user_department
            }
        });

    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Error user login!"
        });
    }
};