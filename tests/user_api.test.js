const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const helper = require("../tests/test_helper");

beforeEach(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("secretpassword", 10);
  const user = new User({ username: "root", passwordHash });

  await user.save();
});

describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "jamesbond07",
      name: "james bond",
      password: "jbond777",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const savedUser = response.body;
    expect(savedUser).toBeDefined();

    const usersAtEnd = await helper.usersInDB();

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);

    expect(usernames).toContain("jamesbond07");
  });

  test("creation fails with proper status code and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "root",
      name: "superUser",
      password: "sprusr",
    };
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

describe("using invalid info", () => {
  test("returns an error with 400 status code if password <3 characters long", async () => {
    const usersAtStart = await helper.usersInDB();

    const newUser = {
      username: "john_hi",
      name: "john",
      password: "pw",
    };

    const response = await api.post("/api/users").send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDB();

    expect(usersAtStart).toEqual(usersAtEnd);
  });

  test("returns an error with 400 status code if username <3 characters long", async () => {
    const usersAtStart = await helper.usersInDB();
    const newUser = {
      username: "jo",
      name: "john",
      password: "psrd",
    };
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtStart).toEqual(usersAtEnd);
  });
});
