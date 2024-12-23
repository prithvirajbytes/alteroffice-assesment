require("dotenv").config();

const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const routes = require("./src/routes/index.js");
// import swagger ui
const swaggerui = require("swagger-ui-express");
const YAML = require("yamljs");
const bodyParser = require("body-parser");
const { monitor_api } = require("./src/middleware/monitor-api.js");
const initializeRedisClient = require("./src/config/redis.js");

const PORT = process.env.PORT;

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // React app in development
  "http://gomarble-assessment.centralindia.cloudapp.azure.com",
];

const corsOptions = {
  credentials: true,
  origin: allowedOrigins, // Whitelist the domains you want to allow
};
// Get the Origin header from the request
app.use(
  cors({
    origin: "*", // Allows all origins
    credentials: true, // Allow cookies, authorization headers, etc.
  })
);

// app.use(cors(corsOptions));

app.use(bodyParser.json());

// SWAGGER MIDDLEWARE FOR DOCUMENTATION
const swaggerDocument = YAML.load("./swagger.yaml");
const swaggerOptions = {
  swaggerOptions: {
    oauth2RedirectUrl: process.env.GOOGLE_REDIRECT_URI,
    initOAuth: {
      clientId: process.env.GOOGLE_CLIENTID,
      scopes: "profile email",
    },
  },
};
app.use(
  "/api-docs",
  swaggerui.serve,
  swaggerui.setup(swaggerDocument, swaggerOptions)
);
app.use(monitor_api);

//routes
app.use("/", routes); //publicRoute

// global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.code || 500;
  console.error({ message: err.message || err, code: statusCode });
  res.status(statusCode).json({ message: err.message || err });
  return;
});

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection error:", error));

module.exports = app;
