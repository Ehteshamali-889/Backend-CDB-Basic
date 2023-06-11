const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user");


const app = express();
app.get('/', function (req, res) {
  res.json('This is my career dev')
})


const server = require("http").createServer(app);


const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/user", userRouter);



const url =
  "mongodb+srv://hawg_devs:dev123@devscluster.ks4rryd.mongodb.net/?retryWrites=true&w=majority";
// const url = "mongodb://localhost:27017";
mongoose.connect(url, { useNewUrlParser: true }, (err) => {
  if (err) throw err;
  console.log("Connected to Database");
});

server.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});
