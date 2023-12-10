const db = require('../util/database');

module.exports = class User {
    constructor(firstname, middlename, lastname, gender, birthdate, age, email, username, password, title, equipped_title, points, user_rank){
        this.firstname = firstname;
        this.middlename = middlename;
        this.lastname = lastname;
        this.gender = gender;
        this.birthdate = birthdate;
        this.age = age;
        this.email = email;
        this.username = username;
        this.password = password;
        this.title = title;
        this.equipped_title = equipped_title;
        this.points = points;
        this.user_rank = user_rank;
    }

    static find(email) {
        return db.execute(
            'SELECT * FROM tbl_user WHERE email = ?;',
            [email]
        );
    }

    static save(user) {
        return db.execute(
            'INSERT INTO tbl_user(firstname, middlename, lastname, gender, birthdate, age, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
            [user.firstname, user.middlename, user.lastname, user.gender, user.birthdate, user.age, user.email, user.username, user.password]
        );
    }

    static delete(email) {
        return db.execute(
            'DELETE FROM tbl_user WHERE email = ?;',
            [email]);
    }

    static changeTitle(equipped_title, email) {
    return db.execute(
        'UPDATE tbl_user SET equipped_title = ? WHERE email = ?;',
        [equipped_title, email]);
    }

    static insertPoints(points, email) {
    return db.execute(
        'UPDATE tbl_user SET user_points = user_points + ? WHERE email = ?;',
        [points, email]);
    }
    
    static update(user, email) {
    return db.execute(
        'UPDATE tbl_user SET firstname = ?, middlename = ?, lastname = ? , gender = ?, birthdate = ?, age = ?, email = ?, username = ? WHERE email = ?;',
        [user.firstname, user.middlename, user.lastname, user.gender, user.birthdate, user.age, user.email, user.username, email]);
    }

    static findTitle(title) {
        return db.execute('SELECT title_count FROM tbl_achievements WHERE title_name = ?;', [title]);
    }

    static earnedTitle(title_id, id) {
        return db.execute('INSERT INTO tbl_user_titles(earned_title_id, user_id) VALUES (?, ?);', [title_id, id]);
    }

    static promote(user_rank, email) {
        return db.execute(
            'UPDATE tbl_user SET user_rank = ? WHERE email = ?;',
            [user_rank, email]);
    }

    static changePassword(password, email) {
        return db.execute(
            'UPDATE tbl_user SET password = ? WHERE email = ?;',
            [password, email]);
    }
    
    static getAccuracy(id) {
        return db.execute('SELECT AVG(session_grade) AS average_accuracy FROM tbl_user_accuracy WHERE user_id = ?;',
        [id]);
    }

    static getSpeed(id) {
        return db.execute('SELECT AVG(session_grade) AS average_speed FROM tbl_user_speed WHERE user_id = ?;',
        [id]);
    }

    static insertProgress(percent, email) {
        return db.execute('UPDATE tbl_user SET lesson_progress = ? WHERE email = ?;',
        [percent, email]);
    }

    static insertSpeedGrade(speed_grade, id) {
        return db.execute('INSERT INTO tbl_user_speed(session_grade, user_id) VALUES (?, ?);',
        [speed_grade, id]);
    }
    static insertAccuracyGrade(accuracy_grade, id) {
        return db.execute('INSERT INTO tbl_user_accuracy(session_grade, user_id) VALUES (?, ?);',
        [accuracy_grade, id]);
    }
}