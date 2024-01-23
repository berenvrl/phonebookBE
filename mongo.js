//exercises 3.12

//adding mangoose library to the project
const mongoose = require("mongoose");

//getting a password based on argv, if no password argv give error and finish the program
if (process.argv.length < 3) {
  console.log("Please provide password as argument");
  process.exit(1);
}
//after this decleration, you need to write command node mango.js "password" to terminal to save the password
const password = process.argv[2];

//creating necessary url to connect mangodb, user:dbuser, password is a password defined for dbuser
const url = `mongodb+srv://dbuser:${password}@cluster0.gkofa77.mongodb.net/personsApp?retryWrites=true&w=majority`;

//to make out of strict query
mongoose.set("strictQuery", false);

//accessing the database
mongoose.connect(url);

//defining a schema for Persons collection which contains name and number data
const personsSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Persons = mongoose.model("Persons", personsSchema);

if (process.argv.length === 3) {
  //to print saved person obj to db, to get all objs, parameter should be {},otherwise specify it
  console.log("Phonebook:");

  Persons.find({}).then((res) => {
    res.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  //getting name and number
  console.log(process.argv);

  const name = process.argv[3];
  const number = process.argv[4];
  //creating new person based on Persons model
  const person = new Persons({
    name: name,
    number: number,
  });

  //for saving data of person obj to database

  person.save().then((result) => {
    console.log(`added ${name} ${number} to phonebook`);
    //closing db connection, if its not closed, the program never finish its execution
    mongoose.connection.close();
  });
} else {
  console.log("invalid number or arguments");
  process.exit(1);
}
