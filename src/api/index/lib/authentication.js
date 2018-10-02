import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../../../db';
import config from '../../../config';
import crypto from 'crypto';


export function login(emailOrPhone, password, res) {
    if (!emailOrPhone || !password) {
        return res.status(500).send('email/phone and password must be provided');
    }

    let phone = emailOrPhone.replace(/[+()-\s]/gi, '');
    const sql = `SELECT * FROM users WHERE email='${emailOrPhone}' OR phone='${phone}' AND status=1`;
    db.query(sql, (err, rows, fields) => {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            if (rows.length !== 1) {
                return res.send(rows.length + ' users returned');
            }

            const salt_string = rows[0].salt;
            const hmac = crypto.createHmac('sha256', salt_string);
            hmac.update(password);
            const salted_and_hashed_password = hmac.digest('base64');

            if (salted_and_hashed_password !== rows[0].password_hash) {
                return res.send('incorrect password');
            }

            const payload = {
                user_type: rows[0].user_type,
                email: rows[0].email,
                userId: rows[0].user_id,
                organizationId: rows[0].organization_id,
                legalName: rows[0].legal_name,
                phone: rows[0].phone,
                dob: rows[0].dob
            }

            const token = jwt.sign(payload, config.jwtSecret, {
                expiresIn: 60*60*24
            });

            return res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });

        }
    });
}

export function newUser(user, res) {

    if (!user.legal_name || !user.password_hash || !user.email || !user.dob || !user.phone) {
        return res.send('Email, phone, password, date of birth, and legal name are all required');
    } else {
        user.status = 1;
    }

    //TODO don't hard code '44' as the salt length
    const salt_string = crypto.randomBytes(Math.ceil(44/2))
                        .toString('hex')
                        .slice(0,44);

    //hash password
    const hmac = crypto.createHmac('sha256', salt_string);
    hmac.update(user.password_hash);
    const hashed_password = hmac.digest('base64');
    user.password_hash = hashed_password;
    user.salt = salt_string;
    let sql = `INSERT INTO users SET ?`;
    db.query(sql, user, (err, result) => {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {
            const payload = {
                userId: result.insertId,
                legalName: user.legal_name,
                phone: user.phone,
                userType: 3,
                email: user.email,
                organizationId: null,
                dob: user.dob
            }

            const token = jwt.sign(payload, config.jwtSecret, {
                expiresIn: 60*60
            });

            return res.json({
                success: true,
                message: 'New user added!',
                token: token
            });
        }
    })
}

export function signUp(email, res) {

    if (!email) return res.send('email required');

    let sql = `INSERT INTO user_signups (email) values ('${email}')`;
    db.query(sql, (err, result) => {
        if (err) {
            return res.send(err);
        } else {
            return res.send('sign up succesful');
        }
    });

}
