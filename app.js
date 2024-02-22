const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const personsRouter = require("./controllers/persons");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");
require("express-async-errors");
app.use(express.json());
app.use(cors());

mongoose.set("strictQuery", false);

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB", error.message);
  });

app.use(express.static("dist"));

app.use(middleware.requestLogger);
app.use(
  "/api/persons",
  middleware.tokenExtractor,
  middleware.userExtractor,
  personsRouter
);
app.use("/api/users", usersRouter);
app.use("/api/login", middleware.tokenExtractor, loginRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
  // /api/testing/reset empties database
}

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

module.exports = app;
