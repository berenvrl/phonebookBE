const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("../tests/test_helper");
const Person = require("../models/person");
const User = require("../models/user");

beforeEach(async () => {
  await Person.deleteMany({});
  // await Person.insertMany(helper.initalPersons);

  const personsobj = helper.initialPersons.map((person) => new Person(person));
  const promiseArray = personsobj.map((person) => person.save());

  await Promise.all(promiseArray);
});

describe("when there is initially some persons saved", () => {
  test("persons are returned as json", async () => {
    const { token } = await helper.initialUser();
    await api
      .get("/api/persons")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
  test("all persons are returned", async () => {
    const { token } = await helper.initialUser();

    const response = await api
      .get("/api/persons")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(helper.initialPersons.length);
  });

  test("specific person is within the returned persons", async () => {
    const { token } = await helper.initialUser();
    const response = await api
      .get("/api/persons")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const persons = response.body.map((user) => user.name);
    expect(persons).toContain("bero");
  });
});

describe("viewing a spesific blog", () => {
  test("succeeds with a valid id", async () => {
    const { token } = await helper.initialUser();

    const personsAtStart = await helper.personsInDB();
    const personToView = personsAtStart[0];

    const resultPerson = await api
      .get(`/api/persons/${personToView.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultPerson.body).toEqual(personToView);
  });

  test("fails with status 404 if person does not exist", async () => {
    const { token } = await helper.initialUser();
    const validNonExistingId = await helper.nonExistingID();

    await api
      .get(`/api/persons/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const { token } = await helper.initialUser();

    const invalidId = "invalid-id";

    await api
      .get(`/api/persons/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });
});

describe("addition of a new person", () => {
  test("succeeds with valid data", async () => {
    const { token, userId } = await helper.initialUser();

    const newPerson = {
      name: "new name",
      number: "34-673827991",
      user: userId,
    };

    await api
      .post("/api/persons")
      .send(newPerson)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const personsFinal = await helper.personsInDB();

    expect(personsFinal).toHaveLength(helper.initialPersons.length + 1);

    const names = personsFinal.map((user) => user.name);
    expect(names).toContain("new name");
  });

  test("fails with status code 400 if data invalid", async () => {
    const { userId, token } = await helper.initialUser();

    const newUser = {
      number: "56-588493334",
      user: userId,
    };
    await api
      .post("/api/persons")
      .send(newUser)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    const personsFinal = await helper.personsInDB();

    expect(personsFinal).toHaveLength(helper.initialPersons.length);
  });
});

describe("deletion of a person", () => {
  test("succeeds with status code 204 if id valid", async () => {
    const { token } = await helper.initialUser();

    const persondb = await helper.personsInDB();

    const toBeDeleted = persondb[0];

    await api
      .delete(`/api/persons/${toBeDeleted.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const finalPersons = await helper.personsInDB();
    expect(finalPersons).toHaveLength(helper.initialPersons.length - 1);
    const names = finalPersons.map((user) => user.name);
    expect(names).not.toContain(toBeDeleted.name);
  });
});

describe("updating a person", () => {
  test("updating number of the person", async () => {
    const { token } = await helper.initialUser();

    const personsAtStart = await helper.personsInDB();
    const personToBeUpdated = personsAtStart[0];
    const newnumber = "33-3343434334";

    const response = await api
      .put(`/api/persons/${personToBeUpdated.id}`)
      .send({ number: newnumber })
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.number).toBe(newnumber);
    const personsAtend = await helper.personsInDB();
    const updatedPerson = personsAtend.find(
      (person) => person.id === personToBeUpdated.id
    );
    expect(updatedPerson.number).toBe(newnumber);
  });
});

//afterall function of jest, to close the connection to database
afterAll(async () => {
  await mongoose.connection.close();
});

//Running test one by one
//npm test -- tests/person_api.test.js
