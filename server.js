const express = require('express')
const app = express()
//const morgan = require("morgan");
const cors = require('cors')
require('dotenv').config()
//getting mongoose setup here
const Persons = require('./models/person')

const requestLogger = (request, response, next) => {
    console.log('Method', request.method)
    console.log('Path', request.path)
    console.log('Body', request.body)
    console.log('-----')
    next()
}
const errorHandler = (error, request, response, next) => {
    //console.error(error.message);

    //checks for if its a casterror, caused by an invalid obj id for mongo
    if (error.name === 'CastError') {
    //400 error: request couldnt understood by the server due to malformed syntax
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

//to add the necessary headers to the server's HTTP responses to inform the browser that it is safe to allow requests from a different origin
app.use(cors())
//for accessing data easily when post a new data:
app.use(express.json())

app.use(requestLogger)

//for making express show static content
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
    //mongoose setup
    Persons.find({}).then((persons) => {
        response.json(persons)
    })
})
app.get('/api/persons/:id', (request, response, next) => {
    //mongoose setup
    Persons.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch((error) => next(error))
    //next with error parameter makes error handler middleware executed
})
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (!body.name || !body.number) {
    //   return response.status(400).json({ error: "content missing" });
    // }

    const person = new Persons({
        name: body.name,
        number: body.number,
    })
    //mongoose setup
    person
        .save()
        .then((savedperson) => {
            response.json(savedperson)
        })
        .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    //mongoose setup
    Persons.findByIdAndDelete(id)
        .then((result) => {
            response.status(204).end()
        })
        .catch((error) => next(error))
})
app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    //mongoose setup
    Persons.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then((updatedPerson) => {
            response.json(updatedPerson)
        })
        .catch((error) => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})

//exercises 3.1-3.8
/*
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

//exercise 3.6
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
// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];


*/
