const db = require('../util/database');

module.exports = class Achievements {
    constructor(name) {
        this.name = name;
    }

    static getDescription(name) {
        return db.execute(
            'SELECT title_description FROM tbl_achievements WHERE title_name = ?;',
            [name]);
    }

    static getTitles(id) {
        return db.execute(
            'SELECT earned_title_id FROM tbl_user_titles WHERE user_id = ?;',
            [id]);
        }
    static achievements() {
        return db.execute('SELECT * FROM tbl_achievements');
    }
    
    static achievementDesc(count) {
        return db.execute('SELECT title_description FROM tbl_achievements WHERE title_count = ?;',
        [count]);
    }
}