const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

var uri = `${process.env.DB_URL}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tasksCollection = client.db("TaskDB").collection("tasks");
    const recipeCollection = client.db("TaskDB").collection("recipes");

    app.post("/tasks", async (req, res) => {
      const addWork = req.body;
      const result = await tasksCollection.insertOne(addWork);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = tasksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          task: body.task,
          description: body.description,
          priority: body.priority,
          isCompleted: body.isCompleted,
        },
      };
      const options = { upsert: true };
      const result = await tasksCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    //recipe api

    app.post("/recipes", async (req, res) => {
      const addWork = req.body;
      const result = await recipeCollection.insertOne(addWork);
      res.send(result);
    });

    app.get("/recipes", async (req, res) => {
      const titleQuery = req.query.title;
      const query = {
        title: {
          $regex: new RegExp(titleQuery, "i"),
        },
      };

      const cursor = recipeCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put("/recipe/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: body.title,
          description: body.description,
          image: body.image,
          ingredients: body.ingredients,
        },
      };
      const options = { upsert: true };
      const result = await recipeCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/recipe/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipeCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ success: true, message: "Welcome to the manager APi" });
});

app.listen(port, () => {
  console.log(`Server is running ${port}`);
});
