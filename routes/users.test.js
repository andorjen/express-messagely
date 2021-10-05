"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

let test1Token;
let test2Token;

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
    test2Token = jwt.sign({ username: 'test2' }, SECRET_KEY);
});


describe("GET /users", function () {

    test("can get all users", async function () {
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

});

describe("GET /users/:username", function () {

    test("can get a specific username", async function () {
        let response = await request(app)
            .get("/users/test1")
            .send({ _token: test1Token })

        expect(response.body)
            .toEqual({
                user: {
                    username: "test1",
                    first_name: "Test1",
                    last_name: "Testy1",
                    phone: "+14155550000",
                    join_at: expect.any(String),
                    //Question: in your user.test.js in the models folder you use expect.any(Date). 
                    //However when we do that here it does not pass our tests.
                    last_login_at: expect.any(String)
                }
            });
        expect(response.statusCode).toEqual(200);
    });

    test("can get a specific username", async function () {
        let response = await request(app)
            .get("/users/test1")
            .send({ _token: test2Token })

        expect(response.statusCode).toEqual(401);
        expect(response.body).toEqual({
            error: {
                message: "Unauthorized", status: 401
            }
        });
    });
});

describe("GET /users/:username/to", function () {

    test("can get messages to user", async function () {
        let response = await request(app)
            .get("/users/test2/to")
            .send({ _token: test2Token })

        expect(response.body)
            .toEqual({
                messages: [
                    {
                        id: expect.any(Number),
                        body: 'test-message',
                        sent_at: expect.any(String),
                        read_at: null,
                        from_user: {
                            username: 'test1',
                            first_name: 'Test1',
                            last_name: 'Testy1',
                            phone: "+14155550000"
                        }
                    }
                ]
            });
        expect(response.statusCode).toEqual(200);
    });

    test("Error thrown when user1 goes to user2's messages", async function () {
        let response = await request(app)
            .get("/users/test2/to")
            .send({ _token: test1Token })

        expect(response.statusCode).toEqual(401);
        expect(response.body).toEqual({
            error: {
                message: "Unauthorized", status: 401
            }
        });
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




afterAll(async function () {
    await db.end();
});