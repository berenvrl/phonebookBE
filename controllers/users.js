const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  //join queries for relational db is not supported by mongoose. mongoose accomplishes the join by doing multiple queries which is different from relational db which are transactional, meaning that the state of the db does not change during the time that the query is made.Mongoose join is done with populate method
  const users = await User.find({}).populate("persons", {
    name: 1,
    number: 1,
  });

  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  const existingUser = await User.findOne({ username });

  if (!username || !name || !password) {
    return response
      .status(400)
      .json({ error: "Fill in username, username and password areas!" });
  } else if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: "username and password must be at least 3 characters long",
    });
  } else if (existingUser) {
    return response.status(409).json({ error: "username is already taken" });
  } else {
    const saltRounds = 10;

    //creating hash
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });
    const savedUser = await user.save();

    response.status(201).json(savedUser);
  }
});

module.exports = usersRouter;
