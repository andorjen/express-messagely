"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, BadRequestError } = require("../expressError");

/** POST /login: {username, password} => {token} */
router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;
    if (await User.authenticate(username, password) === true) {
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    }
    throw new UnauthorizedError("Invalid user/password!");
})

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post('/register', async function (req, res, next) {
    const { username, password, first_name, last_name, phone } = req.body;
    const userData = { username, password, first_name, last_name, phone };
    const user = await User.register(userData);
    if (user) {
        const username = user.username;
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    }
    throw new BadRequestError("Invalid registration information.");
})


module.exports = router;