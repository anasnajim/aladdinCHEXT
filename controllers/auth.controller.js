const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const models = require("../models");
const User = models.user;
const Department = models.departments;
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

// register User model
exports.register = async (req, res) => {
    try{        
        const user = {
            user_email: req.body.user_email,
            user_password: req.body.user_password,
            user_firstname: req.body.user_firstname,
            user_lastname: req.body.user_lastname,
            user_department: req.body.user_department
        };
        
        const valid_user = await User.findOne({ where : { user_email : user.user_email } })
        if(valid_user === null){
            User.create(user)
                .then(data => {
                    res.send(data);
                })
                .catch(err => {
                    res.status(400).send({
                        message:
                            _this.validation_message(err) || "Error user registration!"
                    });
                });
        }else{
            res.status(400).send({
                message: "User email address already registered!"
            });
            return;
        }
    }catch(err){
        res.status(500).send({
            message:
                err.message || "Error user registration!"
        });
    }
};

// login User model
exports.login = async (req, res) => {
    try{
        if (!req.body.user_email) {
            res.status(400).send({
                message: "User email address required!"
            });
            return;
        }

        if (!req.body.user_password) {
            res.status(400).send({
                message: "User password required!x"
            });
            return;
        }

        const user = {
            user_email: req.body.user_email,
            user_password: req.body.user_password
        };

        const valid_user = await User.findOne({ where: { user_email: user.user_email } });        
        if (valid_user === null || !valid_user) {
            res.status(400).send({ message: "Invalid email or password!"}); return;
        }

        console.log(valid_user.user_password);

        const valid_pass = await bcrypt.compare(user.user_password, valid_user.user_password);
        if(!valid_pass) {
            res.status(400).send({ message: "Invalid email or password!" }); return;
        }

        const token = jwt.sign({_id: valid_user.id}, process.env.APP_TOKEN_SECRET, { expiresIn: process.env.APP_TOKEN_EXPIRY });
        res.header('auth-token', token).send({ accessToken: token, userInfo: {
            user_email: valid_user.user_email,
            user_firstname: valid_user.user_firstname,
            user_lastname: valid_user.user_lastname,
            user_department: valid_user.user_department
        } });
        
    }catch(err){
        res.status(500).send({
            message:
                err.message || "Error user login!"
        });
    }
};