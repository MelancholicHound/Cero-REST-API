const db = require('../util/database');

module.exports = class Chapters {
    constructor(chapter, mod_num) {
        this.chapter = chapter; 
        this.mod_num = mod_num;
    }

    static retrieveChapter(mod_num) {
        return db.execute(
            "SELECT * FROM tbl_module_chapters WHERE mod_num = ?;",
            [mod_num]);
    }

    static getChapter(chapter) {
        return db.execute(
            "SELECT JSON_EXTRACT(CAST(chap_content AS CHAR), '$.chapter') AS chapter_content, JSON_EXTRACT(CAST(chap_desc AS CHAR), '$.description') AS chapter_description, chap_name, chap_title FROM tbl_module_chapters WHERE chap_count = ?;",
            [chapter]);
    }
}