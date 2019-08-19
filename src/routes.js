const generalData = require('./general');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const Data = require('./dataSchema');
const mongoose = require('mongoose');

// this is our MongoDB database
var dbRoute = '<mongodb-url>';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });
let db = mongoose.connection;

db.once('open', () => {
  console.log('connected to the database');
});

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  })
})

router.post('/contact', upload.single('photo'), [
  check('firstName')
    .isLength({ min: 1 })
    .withMessage('First Name is required')
    .trim(),
  check('lastName')
    .isLength({ min: 1 })
    .withMessage('Last Name is required')
    .trim(),
  check('message')
    .isLength({ min: 1, max: 255 })
    .withMessage('Message is required')
    .trim(),
  check('email')
    .isEmail()
    .withMessage('That email doesn‘t look right')
    .trim()
    .normalizeEmail()
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('contact', {
      data: req.body,
      errors: errors.mapped(),
      csrfToken: req.csrfToken()
    });
  }

  let oData = new Data();

  if (req.file) {
    console.log('Uploaded: ', req.file);
    oData.image = req.file.buffer;
  }

  const data = matchedData(req);
  console.log('Sanitized: ', data);

  oData.firstName = data.firstName;
  oData.lastName = data.lastName;
  oData.message = data.message;
  oData.email = data.email;
  oData.date = new Date();
  oData.status = generalData[0].desc; // New
  oData.approved = false;

  oData.save((err, data) => {
    if (err) return res.json({ success: false, error: err });
    req.flash('success', `Thanks for the message! Your record id is ${data._id}. I‘ll be in touch :)`);
    res.redirect('/');
    // return res.json({ success: true });
  });

  // req.flash('success', 'Thanks for the message! I‘ll be in touch :)');
  // res.redirect('/');
});

module.exports = router