const db = require('../util/database');

module.exports = class Module {
    constructor(module, mod_num, mod_name) {
        this.module = module;
        this.mod_num = mod_num;
        this.mod_name = mod_name;
    }

    static allModules() {
        return db.execute("SELECT * FROM tbl_module;");
    }

    static selectModule(mod_num) {
        return db.execute("SELECT * FROM tbl_module WHERE mod_num= ?;", [mod_num]);
    }

    static searchModule(mod_name) {
        const searchInput = "%" + mod_name + "%";
        return db.execute("SELECT * FROM tbl_module WHERE mod_name LIKE ?;", [searchInput]);
    }
}