const db = require('../util/database');

module.exports = class Questions {
    constructor (difficulty, set) {
       this.difficulty = difficulty;
       this.set = set;
    }

    static takeEasyQuestion(set) {
        return db.execute(
            "SELECT JSON_EXTRACT(CAST(set_content AS CHAR), '$.questions') AS easySet FROM tbl_easy_quiz WHERE set_num = ?;",
            [set]);
    }

    static takeAverageQuestion(set) {
        return db.execute(
            "SELECT JSON_EXTRACT(CAST(set_content AS CHAR), '$.questions') AS averageSet FROM tbl_medium_quiz WHERE set_num = ?;", 
            [set]);
    }

    static takeHardQuestion(set) {
        return db.execute(
            "SELECT JSON_EXTRACT(CAST(set_content AS CHAR), '$.questions') AS hardSet FROM tbl_hard_quiz WHERE set_num = ?;", 
            [set]);
    }

    static takeAllEasyQuestion() {
        return db.execute("SELECT set_num FROM tbl_easy_quiz;");
    }
    static takeAllMediumQuestion() {
        return db.execute("SELECT set_num FROM tbl_medium_quiz;");
    }
    static takeAllHardQuestion() {
        return db.execute("SELECT set_num FROM tbl_hard_quiz;");
    }
}