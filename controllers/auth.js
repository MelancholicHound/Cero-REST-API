const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const Module = require('../models/module');
const Chapter = require('../models/chapter');
const Question = require('../models/question');
const Achievement = require('../models/achievement');
const Leaderboards = require('../models/leaderboards');
const { EMAIL, PASSWORD } = require('../models/env');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD
    }
  });
const users = {}

function numericOTP (length) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits.charAt(randomIndex);
  }
  return otp;
}
exports.signup = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) return;

    const firstname = req.body.firstname;
    const middlename = req.body.middlename;
    const lastname = req.body.lastname;
    const gender = req.body.gender;
    const birthdate = req.body.birthdate;
    const age = req.body.age;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    try { 
        const hashedPassword = await bcrypt.hash(password, 12);

        const userDetails = {
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            gender: gender,
            birthdate: birthdate,
            age: age,
            email: email,
            username: username,
            password: hashedPassword
        }
        
        const otp = numericOTP(4);
        const mailOptions = {
            from: 'cero.tutoringsystem@gmail.com',
            to: email,
            subject: 'Your One-Time Password (OTP) for Secure Access',
            text: `Hello ${username},

We are delighted that you've chosen Cero for your learning journey. To ensure the utmost security of your account and to provide you with a seamless experience, we have implemented a One-Time Password (OTP) system.         

Your OTP for secure access is: ${otp}   

Please use this code to verify your identity and gain access to your Cero account. Remember that this OTP is for one-time use only and should not be shared with others.       

Should you encounter any issues or have questions about our platform, our dedicated support team is here to assist you. We are committed to helping you succeed in your learning goals.      

Thank you for choosing Cero - your success is our priority.

Best regards,
Soliloquist
Cero Tutoring System
furyx.resonance@gmail.com`
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}`);
          } catch (err) {
            if(!err.statusCode) {
              err.statusCode = 500;
          }
          next(err);
          }

          users[email] = otp;

          await User.save(userDetails);
          res.status(200).json({ message: 'OTP sent to email. Proceed to verify.'});
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.verifyOTP = async(req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) return;

  const { email, otp } = req.body;

  try {
    const storedOTP = users[email];

    if (!storedOTP || storedOTP !== otp) {
      const error = new Error('Error ocurred in validating OTP');
      error.statusCode = 400;
      throw error;
    }
  
    delete users[email];
    console.log('Verification Complete');
    res.status(200).json({ message: 'Verification Complete'});
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
      User.delete(email);
    }
    next(err);
  }
}

exports.login = async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try { 
        const user = await User.find(email);

        if(user[0].length !== 1) {
            const error = new Error('A user with this email does not exist');
            error.statusCode = 400;
            throw error;
        }
        
        const storedUser = user[0][0];
        const isEqual = await bcrypt.compare(password, storedUser.password);

        if(!isEqual) {
            const error = new Error('The password is incorrect');
            error.statusCode = 400;
            throw error;
        }

        const token = jwt.sign({
          id: storedUser.user_id,
          firstname: storedUser.firstname,
          middlename: storedUser.middlename,
          lastname: storedUser.lastname,
          gender: storedUser.gender,
          birthdate: storedUser.birthdate,
          age: storedUser.age,
          email: storedUser.email,
          userRank: storedUser.user_rank,
          userPoints: storedUser.user_points,
          userTitle: storedUser.user_title,
          userId: storedUser.user_id,
          username: storedUser.username,
          equipped: storedUser.equipped_title,
          lesson: storedUser.lesson_progress
        },
        'secretfortoken',
        {expiresIn: '1'}
        );
        res.status(200).json({token: token, userId: storedUser.user_id});
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.chapters = async (req, res, next) => {
  const chapter = req.body.chapter;

  if (!chapter) {
    const error = new Error("Chapter parameter is missing");
    error.statusCode = 400;
    throw error;
  }

  try {
    const chapterData = await Chapter.getChapter(chapter);
    res.status(200).json(chapterData[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.question = async (req, res, next) => {
  const difficulty = req.body.difficulty;
  const set = req.body.set;

  if (!difficulty || !set) {
    const error = new Error('Difficulty or Set parameters are missing');
    error.statusCode = 400;
    throw error;
  }

  try {
    if (difficulty === 'easy') {
      const setRequest = await Question.takeEasyQuestion(set);
      this.questionContent = setRequest[0][0];
      if (!this.questionContent || this.questionContent.length === 0) {
        const error = new Error(`Question ${set} not found`);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json( this.questionContent );
    } else if (difficulty === 'average') {
      const setRequest = await Question.takeAverageQuestion(set);
      this.questionContent = setRequest[0][0];
      if (!this.questionContent || this.questionContent.length === 0) {
        const error = new Error(`Question ${set} not found`);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json( this.questionContent );
    } else if (difficulty === 'hard') {
      const setRequest = await Question.takeHardQuestion(set);
      this.questionContent = setRequest[0][0];
      if (!this.questionContent || this.questionContent.length === 0) {
        const error = new Error(`Question ${set} not found`);
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json( this.questionContent );
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}

exports.description = async(req, res, next) => {
  const achievement = req.body.achievement;

  if (!achievement) {
    const error = new Error("Achivement parameter is missing");
    error.statusCode = 400;
    throw error;
  }

  try {
    const fetchedData = await Achievement.getDescription(achievement);
    const description = fetchedData[0][0];
    if (!description || description.length === 0) {
      const error = new Error(`Description not found`);
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json( description );
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.changeTitle = async(req, res, next) => {
  const titleFetched = req.body.equipped_title;
  const email = req.body.email;
  try {
    await User.changeTitle(titleFetched, email);
    res.status(200).json("Updated Successfully!");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  } 
}

exports.addPoints = async(req, res, next) => {
  const points = req.body.points;
  const email = req.body.email;
  try {
    await User.insertPoints(points, email);
    res.status(200).json(`${points} points has been added to this email: ${email}`);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  } 
}

exports.topTen = async(req, res, next) => {
  const topTen = await Leaderboards.getTopTen();
  res.status(200).json(topTen);
}

exports.placements = async(req, res, next) => {
  const email = req.body.email;

  if (!email) {
    const error = new Error("No email detected!");
    error.statusCode = 400;
    throw error;
  }
  try {
    const userPlacements = await Leaderboards.getPlacements(email);
    res.status(200).json(userPlacements[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  } 
}

exports.update = async(req, res, next) => {
  const firstname = req.body.firstname;
  const middlename = req.body.middlename;
  const lastname = req.body.lastname;
  const gender = req.body.gender;
  const birthdate = req.body.birthdate;
  const age = req.body.age;
  const email = req.body.email;
  const username = req.body.username;
  try {
    const userDetails = {
      firstname : firstname,
      middlename : middlename,
      lastname : lastname,
      gender : gender,
      birthdate : birthdate,
      age : age, 
      email : email,
      username : username,
    }
    await User.update( userDetails , email );
    res.status(200).json("Updated successfully!");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.earnedTitle = async(req, res, next) => {
  const title = req.body.title;
  const id = req.body.id;
  try {
    const titleResult = await User.findTitle(title);
    const titleId = titleResult[0][0];
    await User.earnedTitle(titleId.title_count, id);
    res.status(200).json("Title earned!");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.allModules = async(req, res, next) => {
  try {
    let moduleFetched = await Module.allModules();
    res.status(200).json(moduleFetched[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getModule = async(req, res, next) => {
  const mod_num = req.body.mod_num;

  try {
    const fetchedMod = await Module.selectModule(mod_num);
    res.status(200).json(fetchedMod[0])
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAllChapter = async(req, res, next) => {
  const mod_num = req.body.mod_num;
  try {
    const fetchedData = await Chapter.retrieveChapter(mod_num);
    res.status(200).json(fetchedData[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
} 

exports.promote = async(req, res, next) => {
  const user_rank = req.body.user_rank;
  const email = req.body.email;
  try {
    await User.promote(user_rank, email);
    res.status(200).json(`User promoted to ${user_rank}`);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.search = async(req, res, next) => {
  const module = req.body.mod_name;
  try {
    const response = await Module.searchModule(module);
    res.status(200).json(response[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.recover = async(req, res, next) => {
  const email = req.body.email;
  try {
    const existingAccount = await User.find(email);
    if(existingAccount[0].length !== 1) {
      const error = new Error('A user with this email does not exist');
      error.statusCode = 400;
      throw error;
    }
    const storedUser = existingAccount[0][0];
    const otp = numericOTP(4);
    const mailOptions = {
      from: 'cero.tutoringsystem@gmail.com',
      to: email,
      subject: 'Account Recovery - Request for a One-Time Password (OTP)',
      text: `Hello ${storedUser.username}!,
  
        We're here to assist you in recovering your Cero account. If you've forgotten your login credentials or suspect unauthorized access to your account, requesting a One-Time Password (OTP) is the first step towards regaining access.
        
        Here is the OTP that we have generated for you: ${otp}. Please use this OTP to retrieve your lost account.
        
        Your security is important to us, and we're dedicated to helping you throughout the account recovery process. If you face any difficulties or have any questions, don't hesitate to reach out to our support team.
        
        Thank you for choosing Cero. We are committed to ensuring a smooth and secure experience for all our users.
  
  Best regards,
  Soliloquist
  Cero Tutoring System
  furyx.resonance@gmail.com`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({message: `OTP sent to ${email}`});
    console.log(`OTP sent to ${email}`);
    users[email] = otp;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.changePassword = async(req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.changePassword(hashedPassword, email);
    res.status(200).json({message: "Changed password successfully"});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAccuracy = async(req, res, next) => {
  const user_id = req.body.user_id;
  try {
    const aveAccuracy = await User.getAccuracy(user_id);
    res.status(200).json(aveAccuracy[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getSpeed = async(req, res, next) => {
  const user_id = req.body.user_id;
  try {
    const aveSpeed = await User.getSpeed(user_id);
    res.status(200).json(aveSpeed[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.insertProgress = async(req, res, next) => {
  const percent = req.body.percent;
  const email = req.body.email;
  try {
    await User.insertProgress(percent, email);
    res.status(200).json({message: 'Inserted successfully'})
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.insertSpeedGrade = async(req, res, next) => {
  const grade = req.body.grade;
  const id = req.body.id;
  try {
    await User.insertSpeedGrade(grade, id);
    res.status(200).json({message: 'Speed graded!'});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.insertAccuracyGrade = async(req, res, next) => {
  const grade = req.body.grade;
  const id = req.body.id;
  try {
    await User.insertAccuracyGrade(grade, id);
    res.status(200).json({message: 'Accuracy graded!'});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getUserTitles = async(req, res, next) => {
  const id = req.body.id;
  try {
    const titles = await Achievement.getTitles(id);
    res.status(200).json(titles[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAllTitles = async(req, res, next) => {
  try {
    const titles = await Achievement.achievements();
    res.status(200).json(titles[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.titleDesc = async(req, res, next) => {
  const id = req.body.id;
  try {
    const titleDesc = await Achievement.achievementDesc(id);
    res.status(200).json(titleDesc[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAllEasySet = async(req, res, next) => {
  try {
    const easySet = await Question.takeAllEasyQuestion();
    res.status(200).json(easySet[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAllMediumSet = async(req, res, next) => {
  try {
    const mediumSet = await Question.takeAllMediumQuestion();
    res.status(200).json(mediumSet[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAllHardSet = async(req, res, next) => {
  try {
    const hardSet = await Question.takeAllHardQuestion();
    res.status(200).json(hardSet[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}