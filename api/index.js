import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";
// import User from "../public/js/user";

let api = express.Router();

let DATABASE_NAME = "cs193x_assign3";
if (process.env.DATABASE_NAME) DATABASE_NAME = process.env.DATABASE_NAME;

let Users;
let Posts;
let Class;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  //TODO
  let conn = await MongoClient.connect("mongodb://127.0.0.1");
  let db = conn.db(DATABASE_NAME);
  Users = db.collection("users");
  Posts = db.collection("posts");
  Class = db.collection("class");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

//TODO

api.post("/users", async (req, res) => { // {"id":"ashton"}
  let test = await Users.findOne({ id: req.body.id });
  if (req.body.id === "" || req.body.id === undefined) {
    res.status(400).json({ error: `Missing id` });
    return;
  }
  if (test) {
    res.status(400).json({ error: `${req.body.id} already exists` });
    return;
  }

  let allUsers = await Users.find().toArray();
  for (let user of allUsers) {
    if (user.id === req.body.id) {
      res.status(400).json({ error: `${req.body.id} already exist` });
      return;
    }
  }

  let newUser = ({
    id: req.body.id,
    name: req.body.id,
    following: []
  });
  await Users.insertOne(newUser);
  res.json(newUser);
});

api.get("/users", async (req, res) => { // get list of all users
  let allUsers = await Users.find().toArray();
  let result = [];
  for (let user of allUsers) {
    result.push(user.id);
  }
  res.json( { result } );
});

api.get("/users/:id", async (req, res) => {
  let id = req.params.id;
  let result = await Users.findOne( { id: id });
  if (!result) {
    res.status(404).json({ error: `No user with ID ${req.params.id}` });
    return;
  }
  let user = ({
    id: result.id,
    name: result.name,
    avatarURL: result.avatarURL,
    following: result.following
  });
  res.json(user);
});

api.get("/classes/:class", async (req, res) => {
  let cl = req.params.class;
  let data = await Class.findOne({ circle: cl });
  let posts = data.posts;
  res.send(posts);
});

api.get("/posts", async (req, res) => {
  let array = await Posts.find().toArray();
  res.json(array);
});

api.post("/users/:id/posts/:class", async (req, res) => { // {"text":"ashton"}
  let cl = req.params.class;
  let key = Object.keys(req.body);

  if (JSON.stringify(req.body) === JSON.stringify({}) || key[0] !== "text") {
    res.status(400).json({ error: `Missing Text` });
    return;
  };

  let id = req.params.id;
  let user = await Users.findOne({ id: id });
  if (!user) {
    res.status(404).json({ error: `no user with ID ${id}` });
  }
  let postObj = ({
    userId: id,
    time: new Date().toISOString(),
    text: req.body.text,
    class: cl
  });
  let posts = await Posts.find({ userId: req.params.id });
  await Posts.insertOne( postObj );
  res.json( { success: true } );
});

api.patch("/user/:id", async (req, res) => {
  let id = req.params.id;
  let user = await Users.findOne({ id: id });
  // user.name =
});

api.post("/classes/:class", async (req, res) => {
  let newClass = req.params.class;
  let newCircle = ({
    circle: newClass,
    posts: [],
    users: []
  });
  await Class.insertOne(newCircle);
  res.json( { success: true } );
});

api.get("/classes", async (req, res) => {
  let allCircles = await Class.find().toArray();
  res.send(allCircles);
});


api.post("/classes/", async (req, res) => {
});

/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
