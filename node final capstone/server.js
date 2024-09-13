const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const connectDb = require("./config/dbConnection");

require("dotenv").config();
const app = express();
connectDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});
app.use("/api/users", userRoutes, exerciseRoutes);

app.use(errorHandler);

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

// http://localhost:3000/api/users/661548dc3f4d5eaed71c961f/logs?from=2016-01-01&to=2019-01-01&limit=2
