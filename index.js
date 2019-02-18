const mongoose = require("mongoose");
const home = require("./routes/home");
const genres = require("./routes/genres");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const customers = require("./routes/customers");
const express = require("express");
const app = express();

// Connect to DB
mongoose.connect("mongodb://localhost/vidly",{useNewUrlParser: true})
    .then(success => console.log("Connected to VidlyDB..."))
    .catch(err => console.erro(`[Error] ${err.message}`));

app.use(express.json());
app.use("/", home);
app.use("/api/genres", genres);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/customers", customers);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Vidly server started on port ${port}`);
});