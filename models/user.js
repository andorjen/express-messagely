"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at )
             VALUES ($1, $2, $3, $4, $5, LOCALTIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password 
          FROM users 
          WHERE username=$1`,
      [username]);
    let user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password) === true) {
      return true;
    } else {
      return false;
    }
  }
  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users
          SET last_login_at=CURRENT_TIMESTAMP
          WHERE username=$1`,
      [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone
          FROM users`);
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
          FROM users
          WHERE username = $1`,
      [username]);
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is //Question: is this right? Shouldn't this be from_user?
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const messageResults = await db.query(
      `SELECT id, to_username AS to_user , body, sent_at, read_at
          FROM messages
          WHERE from_username = $1`,
      [username]);

    let fromMessages = messageResults.rows;
    for (let message of fromMessages) {
      const toUserResults = await db.query(
        `SELECT username, first_name, last_name, phone
            FROM users
            WHERE username = $1`,
        [message.to_user]);
      message.to_user = toUserResults.rows[0]
    }
    return fromMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messageResults = await db.query(
      `SELECT id, from_username AS from_user , body, sent_at, read_at
          FROM messages
          WHERE to_username = $1`,
      [username]);

    let toMessages = messageResults.rows;
    for (let message of toMessages) {
      const fromUserResults = await db.query(
        `SELECT username, first_name, last_name, phone
              FROM users
              WHERE username = $1`,
        [message.from_user]);
      message.from_user = fromUserResults.rows[0];
    }

    return toMessages;
  }
}


module.exports = User;
