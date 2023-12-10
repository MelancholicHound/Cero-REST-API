const db = require('../util/database');

module.exports = class Leaderboards {
    constructor(email) {
        this.email = email;
    }

    static getTopTen() {
        return db.query(
            'SELECT * FROM leaderboards LIMIT 10'
        )
    }
    
    static getPlacements(email) {
        return db.execute(
            "SELECT username, user_rank, user_points, FIND_IN_SET(user_points, (SELECT GROUP_CONCAT(DISTINCT user_points ORDER BY user_points DESC) FROM tbl_user)) AS placement FROM tbl_user WHERE email = ?;",
            [email]);
    }
}