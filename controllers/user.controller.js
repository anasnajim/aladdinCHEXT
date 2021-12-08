const { sequelize } = require('../models');
const models = require("../models");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const UserReferral = models.user_referrals;
const UserCredits = models.user_credits;
const UserUsages = models.user_usages;
const where = models.Sequelize.where;
const fn = models.Sequelize.fn;
const col = models.Sequelize.col;
const Op = models.Sequelize.Op;
const literal = models.Sequelize.literal;


let _this = this;

exports.validation_message = (err) => {
    err_list = err.message.split(",\n");
    if (Array.isArray(err_list)) {
        err_specific = err_list[0].split(": ");
        return err_specific[1];
    }
    return err.message;
};

// credits UserCredits
exports.credits = async (req, res) => {
    try{
        const credits = await UserCredits.findAll({
            attributes: [
                [fn('SUM', col('credits')), 'credits'],
                [fn('SUM', col('used_credits')), 'used_credits']
            ],
            where: {
                user_id: req.user_id,
                [Op.and]: [
                    literal(`"createdAt" + INTERVAL '90 days' >= now()`)
                ]
            }
        });

        let remaining_credits = credits[0].credits - credits[0].used_credits;

        res.send({ credits: remaining_credits });

    }catch(err){
        res.status(500).send({
            message:
                err.message || "Error user credits information!"
        });
    }
};

// weekly usage
exports.weekly = async(req, res) => {
    try{

        const weekmax = await UserUsages.count({
            where: {
                user_id: req.user_id,
                [Op.and]: [
                    literal(`week_usage = DATE_PART('week', now())`)
                ]
            }
        });

        if(weekmax < 3){
            res.send({ weekmax : false });
            return;
        }

        res.send({ weekmax : true });

    }catch(err){
        res.status(500).send({
            message:
                err.message || "Error user weekly usage check!"
        });
    }
};

// referral UserCredits
exports.referral = async (req, res) => {
    try{
        const refer_email = req.body.refer_email;
        
        const refer_code = (Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8) ).toUpperCase();

        const msg = {
            to: refer_email,
            from: process.env.SENDGRID_MAIL_PORTAL,
            subject: process.env.ALADDINB2B_REFERRAL_SUBJ,
            text: `Dear ${refer_email}, Your friend (name) is using AladdinB2B to meet the right business matches and has referred you to try it out. Sign up now to get free 30 credits for your 14 days trial. Use the code ${refer_code} when signing up. Thank you and happy matching! AladdinB2B`,
            html: `Dear ${refer_email},<br/><br/>Your friend (name) is using AladdinB2B to meet the right business matches and has referred you to try it out.<br/><br/>Sign up now to get a free 30 credits for your 14 days trial.<br/><br/>Use the code below when signing up.<br/><br/>${refer_code}<br/><br/><br/>Thank you and happy matching!<br/>AladdinB2B`,
        };

        sgMail
        .send(msg)
        .then( async (response) => {
            if(response[0].statusCode === 202){

                const user_referral = {
                    user_id: req.user_id,
                    referral_email: refer_email,
                    referral_code: refer_code
                };

                await UserReferral.create(user_referral);
                
                res.status(200).send({
                    message: "refsent"
                });

            }else{
                res.status(500).send({
                    message:
                        err.message || "Error sending referral!"
                });
            }   
        })
        .catch((error) => {
            console.error(error)
        })

    }catch(err){
        res.status(500).send({
            message:
                err.message || "Error sending referral!"
        });
    }
};