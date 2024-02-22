//routes are defined for the router object
const personsRouter = require("express").Router();
const Person = require("../models/person");
const mongoose = require("mongoose");

// / instead of /api/persons
personsRouter.get("/", async (request, response) => {
  const user = request.user;

  if (user) {
    const persons = await Person.find({ user: user._id }).populate("user", {
      username: 1,
      name: 1,
    });
    response.json(persons);
  } else {
    response.status(400).end();
  }
});

// /:id instead of /api/persons/:id
personsRouter.get("/:id", async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: "Invalid ID" });
  } else {
    const person = await Person.findById(id);
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  }
});

// / instead of /api/persons
personsRouter.post("/", async (request, response) => {
  const body = request.body;
  const user = request.user;

  try {
    if (body.name && body.number) {
      const person = new Person({
        name: body.name,
        number: body.number,
        user: user._id,
      });

      if (user) {
        if (person.user.toString() === user._id.toString()) {
          const savedPerson = await person.save();

          console.log("saved person", savedPerson);

          user.persons = user.persons.concat(savedPerson._id);

          await user.save();

          response.status(201).json(savedPerson);
        } else {
          response.status(403).json({ error: "invalid user" });
        }
      } else {
        return response.status(401).json({ error: "Unauthorized access" });
      }
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      console.error(err._message);
      return response.status(400).json({ error: err.message });
    } else {
      console.log(err);
      return response.status(400).json({ error: err.message });
    }
  }
});

// /:id instead of /api/persons/:id
personsRouter.delete("/:id", async (request, response) => {
  const { id } = request.params;

  const user = request.user;

  if (user) {
    const person = await Person.findById(id);

    if (!person) {
      return response.status(404).json({ error: "Person not found" });
    }
    if (person.id === id) {
      await Person.findByIdAndDelete(id);
      response.status(204).end();
    }
  } else {
    return response.status(401).json({ error: "Unauthorized access" });
  }
});

// /:id instead of /api/persons/:id
personsRouter.put("/:id", async (request, response, next) => {
  const { name, number } = request.body;
  const id = request.params.id;

  const user = request.user;

  if (user) {
    const person = {
      name,
      number,
    };
    const updatedPersons = await Person.findByIdAndUpdate(id, person, {
      new: true,
    });

    response.json(updatedPersons);
  } else {
    return response.status(401).json({ error: "Unathorized access" });
  }
});

module.exports = personsRouter;
