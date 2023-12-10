const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const db = require('../util/database');
const User = require('../models/user');
const authController = require('../controllers/auth');

router.post(
    '/signup',
    [
        body('firstname').trim().notEmpty(),
        body('middlename').trim().notEmpty(),
        body('lastname').trim().notEmpty(),
        body('gender').trim().notEmpty(),
        body('birthdate').isDate(),
        body('age').isInt(),
        body('status').trim(),
        body('email').isEmail().withMessage('Please enter a valid email!')
        .custom(async (email) => {
            const user = await User.find(email);
            if (user[0].length > 0) {
                return Promise.reject('Email address already exist');
            }
        }),
        body('username')
        .custom(async (username) => {
            const user = await User.find(username);
            if (user[0].length > 0) {
                return Promise.reject('Username already exist');
            }
        }),
        body('password').isLength({ min: 8 })
    ], authController.signup
  );

router.post('/verify-otp', authController.verifyOTP);

router.post('/login', authController.login);

router.post('/chapters', authController.chapters);

router.post('/questions', authController.question);

router.post('/desc', authController.description);

router.post('/change-title', authController.changeTitle);
 
router.post('/add-points', authController.addPoints);

router.get('/leaderboards', authController.topTen);

router.post('/placements', authController.placements);

router.post('/update',[
        body('firstname').trim().notEmpty(),
        body('middlename').trim().notEmpty(),
        body('lastname').trim().notEmpty(),
        body('gender').trim().notEmpty(),
        body('birthdate').isDate(),
        body('age').isInt(),
        body('status').trim(),
        body('email').isEmail().withMessage('Please enter a valid email!'),
        body('username').trim().notEmpty(),
], authController.update);

router.post('/earn', authController.earnedTitle);

router.post('/module', authController.allModules);

router.post('/get-module', authController.getModule);

router.post('/all-chapters', authController.getAllChapter);

router.post('/promote', authController.promote);

router.post('/search', authController.search);

router.post('/recover', authController.recover);

router.post('/change-password', authController.changePassword);

router.post('/accuracy', authController.getAccuracy);

router.post('/speed', authController.getSpeed);

router.post('/progress', authController.insertProgress);

router.post ('/grade-speed', authController.insertSpeedGrade);

router.post('/grade-accuracy', authController.insertAccuracyGrade);

router.post('/user-titles', authController.getUserTitles);

router.post('/all-titles', authController.getAllTitles);

router.post('/title-desc', authController.titleDesc);

router.post('/all-easy', authController.getAllEasySet);

router.post('/all-medium', authController.getAllMediumSet);

router.post('/all-hard', authController.getAllHardSet);

module.exports = router;