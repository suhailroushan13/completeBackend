import express from "express";
import config from "config";
import bcrypt from "bcrypt";
import userModel from "../../models/Users/Users.js";
import sendSMS from "../../utils/sendSMS.js";
import sendMail from "../../utils/sendEmail.js";

import jwt from "jsonwebtoken"
let JWT_SECRET = config.get("JWT_SECRET")
let URL = config.get("SERVER_URL");


const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    console.log(fullName, email, password, phone);

     

    // Check for duplicate email or phone
    const existingUser = await userModel.findOne({email})
    if (existingUser) {
      return res.status(400).json({ msg: "Email  already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification tokens (you can use any token generation logic)
    const emailToken = Math.random().toString(36).substring(2);
    const phoneToken = Math.random().toString(36).substring(2);

    console.log(emailToken,phoneToken);
    

    // Save the user
    const newUser = {
      fullName,
      email,
      phone,
      password: hashedPassword,
      userVerifyToken: {
        email: emailToken,
        phone: phoneToken,
      },
    };

    await userModel.create(newUser);

    // Send verification notifications

    await sendMail({
        subject: "Email Verification",
        to: email,
        html: `
            <p>Click the link below to verify your email:</p>
            <a href="${URL}/api/public/emailverify/${emailToken}">Verify Email</a>
            <br>
            <p>If the link doesn't work, copy and paste the following URL into your browser:</p>
            <p>${URL}/api/public/emailverify/${emailToken}</p>
        `
    });

    // await sendSMS({
    //     body: `Please verify your phone number using the link below:\n\n${URL}/api/public/phoneverify/${phoneToken}`,
    //     to: phone
    // });

    console.log(`${URL}/api/public/emailverify/${emailToken}`);
    console.log(
      `Please verify your phone number using the link below:\n\n${URL}/api/public/phoneverify/${phoneToken}`
    );

    res
      .status(201)
      .json({
        msg: "User registered successfully. Please verify your email and phone.",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or phone
    const user = await userModel.findOne({email});

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.userVerified.email) {
      return res
        .status(400)
        .json({ msg: "Please verify your email before logging in." });
    }

    // Check if phone is verified
    if (!user.userVerified.phone) {
      return res
        .status(400)
        .json({ msg: "Please verify your phone before logging in." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ msg: "User LoggedIn Successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
});

router.get("/emailverify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await userModel.findOne({ "userVerifyToken.email": token });

    

    if (!user) {
      return res.status(400).json({ msg: "Invalid email verification token." });
    }

    // if(user.userVerified.email == true){
    //   return res.status(400).json({ msg: "User email is already verified." });

    // }

    user.userVerified.email = true;
    user.userVerifyToken.email = null;

    // Save without validating all fields
    await user.save();

    res.status(200).json({ msg: "Email verified successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
});

router.get("/phoneverify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await userModel.findOne({ "userVerifyToken.phone": token });

    if (!user) {
      return res.status(400).json({ msg: "Invalid phone verification token." });
    }

    user.userVerified.phone = true;
    user.userVerifyToken.phone = null;
    await user.save();

    res.status(200).json({ msg: "Phone verified successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
});

export default router;
