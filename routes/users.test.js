"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

let test1Token;

beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
        username: "test1",
        password: "password",
        first_name: "Test1",
        last_name: "Testy1",
        phone: "+14155550000",
    });
    let u2 = await User.register({
        username: "test2",
        password: "password",
        first_name: "Test2",
        last_name: "Testy2",
        phone: "+14155552222",
    });
    let m1 = await Message.create({
        from_username: 'test1',
        to_username: 'test2',
        body: 'test-message'
    })
    test1Token = jwt.sign({ username: 'test1' }, SECRET_KEY);
});


describe("User Routes Test", function () {


    test("can get all users", async function () {
        // res.locals.user.username = 'test1';
        let response = await request(app)
            .get("/users")
            .send({ _token: test1Token })

        expect(response.body)
            .toEqual({
                users: [
                    {
                        username: "test1",
                        first_name: "Test1",
                        last_name: "Testy1"
                    }, {
                        username: "test2",
                        first_name: "Test2",
                        last_name: "Testy2"
                    }
                ]
            });

    });

    /** POST /auth/register => token  */

    // describe("Get /users", function () {

    // });
    /** POST /auth/login => token  */

    //     describe("POST /auth/login", function () {
    //         test("can login", async function () {
    //             let response = await request(app)
    //                 .post("/auth/login")
    //                 .send({ username: "test1", password: "password" });

    //             let token = response.body.token;
    //             expect(jwt.verify(token, SECRET_KEY)).toEqual({
    //                 username: "test1",
    //                 iat: expect.any(Number)
    //             });
    //         });

    //         test("won't login w/wrong password", async function () {
    //             let response = await request(app)
    //                 .post("/auth/login")
    //                 .send({ username: "test1", password: "WRONG" });
    //             expect(response.statusCode).toEqual(401);
    //         });

    //         test("won't login w/wrong password", async function () {
    //             let response = await request(app)
    //                 .post("/auth/login")
    //                 .send({ username: "not-user", password: "password" });
    //             expect(response.statusCode).toEqual(401);
    //         });
    //     });
    // });


});

afterAll(async function () {
    await db.end();
});