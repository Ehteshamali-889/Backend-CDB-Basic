const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: "djhdfdrld",
  api_key: "122194797381583",
  api_secret: "CmKXKbZmy39O72i4zGaQKAnY9-8",
  secure: true,
});

exports.addImage = async (req, res) => {
  try {
    const file = req.files.file;
    // const {id} = req.body;
    console.log(file);
    cloudinary.v2.uploader.upload(
      file.tempFilePath,
      {
        folder: "avatar",
        width: 150,
        height: 150,
        crop: "fill",
      },
      async (err, result) => {
        if (err) throw err;
        // removeTmp(file.tempFilePath);
        console.log({ result });
        // const res = await User.findOneAndUpdate({_id: id}, {image: result.secure_url})
        res.json({ result: result.secure_url });
      }
    );
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.json("All Fields are mandatory");
    }

    const user = await User.findOne({ email: email });
    if (user) {
      return res.json("Email Already exist");
    }

    if (password.length < 6) {
      return res.json("Password must be greater than 6 characters");
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
    });
    await newUser.save();

    res.json("User Registered Successfully");
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) return res.json("User does not exist");

    const isMatch = password == user.password;
    if (!isMatch) return res.json("Invalid Password");
    const refreshToken = createRefreshToken({ id: user._id });
    res.cookie("refreshtoken", refreshToken, {
      httpOnly: true,
      path: "/user/refreshToken",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      msg: "Login Successfull!",
      token: refreshToken,
      admin: user.role,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, id, password, image } = req.body;
    await User.findOneAndUpdate({ _id: id }, { name, password, image });
    res.json("Updated");
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getAccessToken = (req, res) => {
  try {
    const rf_token = req.cookies.refreshtoken;
    console.log("Ref: ", rf_token);
    if (!rf_token) return res.status(400).json({ msg: "Please Login Now" });
    jwt.verify(rf_token, "123455666", (err, user) => {
      if (err) return res.status(400).json({ msg: "Please Login Now" });
      console.log(user);
      const access_token = createAccessToken({ id: user.id });
      res.json({ access_token });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json("User does not exist");
    await User.findOneAndUpdate(
      { email: email },
      {
        password,
      }
    );
    res.json({ msg: "Password Reset" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("refreshtoken", { path: "/user/refreshToken" });
    res.json({ msg: "Logout Successfully" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, "123455666", { expiresIn: "7d" });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, "123455666", { expiresIn: "15m" });
};
