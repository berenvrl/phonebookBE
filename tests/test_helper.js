const Person = require("../models/person");
const User = require("../models/user");

const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const initialPersons = [
  { name: "bero", number: "77-5383748493" },
  { name: "beriro", number: "66-35372728" },
];

const personsInDB = async () => {
  const persons = await Person.find({});

  return persons.map((person) => person.toJSON());
};

const nonExistingID = async () => {
  const person = new Person({ name: "will remove", number: "44-44444444" });
  await person.save();
  await person.deleteOne();

  return person.id.toString();
};

const usersInDB = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

//to give authentication
const initialUser = async () => {
  const userResponse = await api.post("/api/users").send({
    username: "rachelgreen",
    name: "rachel green",
    password: "testpassword",
  });
  const loginResponse = await api.post("/api/login").send({
    username: "rachelgreen",
    password: "testpassword",
  });

  const token = loginResponse.body.token;
  const userId = userResponse.body._id;

  return { token, userId };
};

module.exports = {
  initialPersons,
  nonExistingID,
  personsInDB,
  usersInDB,
  initialUser,
};
