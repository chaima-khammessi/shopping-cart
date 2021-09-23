var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const passport = require('passport');
const Order = require('../models/Order');
const multer = require('multer');
const fs = require('fs')

const fileFilter = function(req,file , cb){
  if(file.mimetype === 'image/jpeg'){
    cb(null , true)
  }else{
    cb(new Error('please upload jpeg image'), false);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname)
  }

})

const upload = multer({
   storage: storage,
   limits :{
     fileSize:1024*1024*5
   },
   fileFilter : fileFilter
  
  });


const csrf = require('csurf');



router.use(upload.single('myfile'),(err , req,res,next)=>{
  if(err){
    req.flash('profileImageError' , (err.message));
    res.redirect('profile');
  }
} );
router.use(csrf());

/* GET users listing. */
router.get('/signup', idNotSignIn, function (req, res, next) {
  var massegesError = req.flash('signupError')
  res.render('user/signup', { messages: massegesError, token: req.csrfToken() })
});



router.post('/signup', [
  check('email').not().isEmpty().withMessage('please enter your email'),
  check('email').isEmail().withMessage('please enter valid your emial'),
  check('password').not().isEmpty().withMessage('please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('please enter password more then 5 char'),
  check('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new error('password and confirm-password not matched');
    }
    return true;
  })

], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    validationMassege = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassege.push(errors.errors[i].msg)
    }
    req.flash('signupError', validationMassege);
    res.redirect('signup')
    return;
  }
  next();
}, passport.authenticate('local-signup', {
  session: false,
  successRedirect: 'signin',
  failureRedirect: 'signup',
  failureMessage: true
}))


router.get('/profile', isSignin, (req, res, next) => {

  if (req.user.cart) {
    totalProducts = req.user.cart.totalquantity
  } else {
    totalProducts = 0
  }

  Order.find({ user: req.user._id }, (err, resualt) => {
    if (err) {
      console.log(err);
    }
    console.log(resualt);
    var messagesError = req.flash('profileError');
    var messageImage = req.flash('profileImageError')
    var hasMassagesError = false;
    if (messagesError.length > 0) {
      hasMassagesError = true;
    }


    res.render('user/profile', {
      checkuser: true,
      chechProfile: true,
      totalProducts: totalProducts,
      userOrder: resualt,
      token: req.csrfToken(),
      massages: messagesError,
      hasMassagesError: hasMassagesError,
      user: req.user,
      messageImage : messageImage,


    })

  })
})

router.get('/signin', idNotSignIn, (req, res, next) => {
  var massegesError = req.flash('signinError');
  res.render('user/signin', { messages: massegesError, token: req.csrfToken() });
})
router.post('/signin', [
  check('email').not().isEmpty().withMessage('please enter your email'),
  check('email').isEmail().withMessage('please enter valid your emial'),
  check('password').not().isEmpty().withMessage('please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('please enter password more then 5 char'),


], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    validationMassege = [];
    for (var i = 0; i < errors.errors.length; i++) {
      validationMassege.push(errors.errors[i].msg)
    }
    req.flash('signinError', validationMassege);
    res.redirect('signin')
    return;
  }
  next();

}, passport.authenticate('local-signin', {
  successRedirect: 'profile',
  failureRedirect: 'signin',
  failureFlash: true
}));

router.post('/updateuser', [
  check('username').not().isEmpty().withMessage('please enter your username'),
  check('email').not().isEmpty().withMessage('please enter your email'),
  check('email').isEmail().withMessage('please enter valid your emial'),
  check('contact').not().isEmpty().withMessage('please enter your contact'),
  check('adress').not().isEmpty().withMessage('please enter your adress'),
  check('password').not().isEmpty().withMessage('please enter your password'),
  check('password').isLength({ min: 5 }).withMessage('please enter password more then 5 char'),
  check('confirmpassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new error('password and confirm-password not matched');
    }
    return true;
  })
],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      validationMassege = [];
      for (var i = 0; i < errors.errors.length; i++) {
        validationMassege.push(errors.errors[i].msg)
      }
      req.flash('profileError', validationMassege);
      console.log(validationMassege);
      res.redirect('profile')
      return;
    } else {
      console.log('user updated');
      const updatedUser = {
        userName: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        adress: req.body.adress,
        password: new User().hashPassword(req.body.password)
      }
      User.updateOne({ _id: req.user._id }, { $set: updatedUser }, (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
          res.redirect('profile')
        }
      })
    }
})
router.post('/uploadfile', (req, res, next) => {
const path = "./public" + req.user.image;
fs.unlink(path ,(err)=>{
  if(err){
    
    req.flash('profileImageError' , (err.message));
    res.redirect('profile');
    return ; 
  } else{
    console.log( req.file);
  console.log((req.file.path).slice(6));
  const newUser = {
    image: (req.file.path).slice(6)
  }
  User.updateOne({ _id: req.user._id }, { $set: newUser }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      console.log(doc);
      res.redirect('profile')

    }
  })
    
  }
  
})


})



router.get('/logout', isSignin, (req, res, next) => {
  req.logOut();
  res.redirect('/');

})


function isSignin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('signin')
    return;
  }
  next()
}

function idNotSignIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/')
    return;
  }

  next();
}




module.exports = router;
