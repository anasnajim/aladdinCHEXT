// 10 days everyday reminders
// wish types: trial / referral / paid

module.exports = app => {
    
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const CronJob = require('cron').CronJob;

    const models = require("../models");

    const job = new CronJob('0 0 * * *', async function() {

        const users = await models.sequelize.query(`
                SELECT * FROM users 
                LEFT JOIN user_credits ON users.id = user_credits.user_id 
                WHERE used_credits < credits 
                AND credit_type = 'trial'
                AND DATEDIFF(user_credits.createdAt + INTERVAL 80 DAY, NOW()) <= 10
        `, { type: models.sequelize.QueryTypes.SELECT });

        let recipients = [];
        users.forEach(user => {
            if(recipients.indexOf(user.user_email) === -1){
                recipients.push(user.user_email);
            }   
        });

        recipients.forEach(recipient => {            
            const msg = {
                to: recipient,
                from: process.env.SENDGRID_MAIL_PORTAL,
                subject: process.env.ALADDINB2B_WISH_REMINDER_SUBJ,
                text: `Dear ${recipient}, Please be reminded that your wishes will reset soon. Thank you, -AladdinB2B`,
                html: `Dear ${recipient},<br/><br/>Please be reminded that your wishes will reset soon.<br/><br/><br/>Thank you,<br/>-AladdinB2B`,
            };

            sgMail
            .send(msg)
            .then( async (response) => {
                if(response[0].statusCode === 202){
                    console.log('Successfully sent email reminder to: '+recipient);
                }else{
                    console.log('Error sending wish email reminder to: '+recipient);
                }
            })
            .catch((error) => {
                console.error(error)
            });

        });

    });
    
    job.start();
};