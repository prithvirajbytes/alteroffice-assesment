const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const { CustomError } = require("../utils/errors/error");
const { default: axios } = require("axios");
const CLIENT_ID = process.env.GOOGLE_CLIENTID;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
// auth a user
exports.googleAuth = async (req, res, next) => {
  try {
    const googlecode = req.query?.code || req.query.access_token;
    console.log(req.query)
    if (!googlecode) {
      throw new CustomError("googleAccessToken is required", 400);
    }

    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: CLIENT_ID,
      client_secret: GOOGLE_SECRET,
      code: googlecode,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token, id_token } = data;
    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(async (response) => {
        const firstName = response.data.given_name;
        const lastName = response.data.family_name;
        const email = response.data.email;
        const avatar = response.data.picture;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          const newUser = new User({
            email,
            firstName,
            lastName,
            avatar,
          });
          await newUser.save();
          const token = jwt.sign(
            { id: newUser._id, email },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

          res.status(200).json({ accessToken: token });
        } else {
          const token = jwt.sign(
            {
              email: existingUser.email,
              id: existingUser._id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          res.json({ accessToken: token, existingUser });
        }
      })
      .catch((err) => {
        // res.status(400).json({ message: "Invalid access token!" });
        console.log(err);
        next(err);
      });
  } catch (error) {
    next(error);
  }
};
exports.googleAuthRedirect = async (req, res, next) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENTID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  try {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};
