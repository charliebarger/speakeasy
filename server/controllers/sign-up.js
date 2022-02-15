const userDB = require("../models/users");
const { check, validationResult } = require("express-validator");

exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    }
    const user = await userDB({
      username: req.body.username,
      avatarURL: req.body.imageUrl,
      password: req.body.password,
    });
    await userDB.create(user);
    res.redirect("/log-in");
  } catch (error) {
    next(error);
  }
};

exports.validate = (req, res) => {
  return [
    check("username", "username is required")
      .notEmpty()
      .isString()
      .isLength({ min: 5, max: 20 })
      .trim(),
    check("imageUrl").exists().isString().trim(),
    check("password", "password is required")
      .notEmpty()
      .isLength({ min: 5, max: 20 })
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new Error("Password confirmation does not match password");
        }
        return true;
      }),
    check("member").isBoolean().optional({ checkFalsy: true }),
    check("admin").isBoolean().optional({ checkFalsy: true }),
  ];
};

//function that returns a random avatar photo from a list of avatar photos
const randomAvatars = () => {
  const images = [
    "http://images6.fanpop.com/image/photos/40800000/soda-me-broda-me-regular-show-xxl-40805603-842-473.png",
    "http://tvline.com/wp-content/uploads/2011/12/5-300111230173120.jpg",
    "https://metro.co.uk/wp-content/uploads/2018/05/sei_14554950.jpg?quality=90&strip=all",
    "https://m.media-amazon.com/images/M/MV5BMjE1NjMyNTM3OF5BMl5BanBnXkFtZTgwMzY1NDEzMjE@._V1_.jpg",
    "https://i.ytimg.com/vi/xUBthxxEHyM/maxresdefault.jpg",
    "https://i.pinimg.com/originals/d8/05/1c/d8051cbf4333197b3aa715039869c4fb.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
};

exports.checkUrl = (req, res, next) => {
  if (req.body.imageUrl == "") {
    req.body.imageUrl = randomAvatars();
  }
  next();
};
