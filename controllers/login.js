//library for generate json web tokens
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return response
      .status(400)
      .json({ error: "Fill in username and password!" });
  }

  //searching user from the db
  const user = await User.findOne({ username });

  //checks password by bcrypt.compare(compare hashes)
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  //401: unauthorized
  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: "invalid username or password" });
  }
  const userForTaken = {
    username: user.username,
    id: user.id,
  };

  //token expires in 60*60 seconds, in one hour
  const token = jwt.sign(userForTaken, process.env.SECRET, {
    expiresIn: 60 * 3600,
  });

  //if password is correct, token is created with method jwt.sign
  //const token = jwt.sign(userForTaken, process.env.SECRET);

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
