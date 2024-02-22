const app = require("./app"); //Express application
const config = require("./utils/config");
const logger = require("./utils/logger");

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

//Express app and the code taking care of the wen server are seperated from each other. One of the adv => application can be tested at the level of HTTP API calls without actually making calls via HTTP over the network, which makes execution faster
