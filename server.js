const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

//for making express show static content
app.use(express.static("dist"));

//for accessing data easily when post a new data:
app.use(express.json());

//to add the necessary headers to the server's HTTP responses to inform the browser that it is safe to allow requests from a different origin
app.use(cors());

//for logging messages to console
//exercise 3.7-3.8
morgan.token("reqBody", function (request, response) {
  return JSON.stringify(request.body);
});

app.use((req, res, next) => {
  if (req.method === "POST") {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :reqBody"
    )(req, res, next);
  } else {
    morgan("tiny")(req, res, next);
  }
});

//temporary data for backend
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

//exercise 3.1
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

//exercise 3.2
app.get("/info", (request, response) => {
  const date = new Date();
  const length = persons.length;
  response.send(`<p>Phonebook has info for ${length} people</p><p>${date}</p>`);
});

//exercise 3.3
app.get("/api/persons/:id", (request, response) => {
  const numberId = Number(request.params.id);
  const selected = persons.find((person) => person.id === numberId);
  if (selected) {
    response.json(selected);
  } else {
    response.status(400).json("No id found").end();
  }
});

//exercise 3.4
app.delete("/api/persons/:id", (request, response) => {
  const selectedId = Number(request.params.id);
  persons = persons.filter((person) => person.id !== selectedId);
  response.status(204).end();
});

//exercise 3.5
const generateId = () => {
  let givenId = Math.floor(Math.random() * 10000) + 1;

  if (persons.some((person) => person.id === givenId)) {
    givenId = Math.floor(Math.random() * 10000) + 1;
  } else {
    return givenId;
  }
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const ifnamesaresame = persons.filter(
    (person) => person.name.toLowerCase() === body.name.toLowerCase()
  );

  const ifnumbersaresame = persons.filter(
    (person) => person.number === body.number
  );

  //exercise 3.6-error handling
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  } else if (ifnamesaresame.length !== 0 || ifnumbersaresame.length !== 0) {
    return response
      .status(400)
      .json({ error: "name and number should be unique" });
  } else {
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    };

    persons = persons.concat(person);
    response.json(person);
  }
});

//use port 3001 if no any PORT is defined
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT} port`);
});
