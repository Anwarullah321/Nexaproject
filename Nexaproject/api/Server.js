//server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectdb.js");

const userRoutes = require("./routes/userRoutes.js");
const adminUserRoutes = require("./routes/adminUserRoutes.js");

const internalUserRoutes = require("./routes/internalUserRoutes.js")
const externalUserRoutes = require("./routes/externalUserRoutes.js");
const mapping = require("./routes/mapping.js");
const app = express();
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy
app.use(cors());

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(express.json());

// Load Routes
app.use("/api", userRoutes);
app.use("/api", adminUserRoutes);
app.use("/api", internalUserRoutes)
app.use("/api", externalUserRoutes)
app.use("/api", mapping)

app.listen(port, ()=> {
    console.log(`Server is listening at PORT no. ${port}`);
});
