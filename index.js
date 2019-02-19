const mongoose = require("mongoose");
const config = require("config");
const home = require("./routes/home");
const auth = require("./routes/auth");
const users = require("./routes/users");
const genres = require("./routes/genres");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const customers = require("./routes/customers");
const express = require("express");
const app = express();

if (!config.get("jwtPrivateKey")){
    console.error("[FATAL ERROR] jwtPrivateKey is not defined!");
    process.exit(1);
}

// Connect to DB
mongoose.connect("mongodb://localhost/vidly",{useNewUrlParser: true})
    .then(() => console.log("Connected to VidlyDB..."))
    .catch(err => console.erro(`[Error] ${err.message}`));


app.use(express.json());
app.use("/", home);
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/genres", genres);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/customers", customers);


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Vidly server started on port ${port}`);
});