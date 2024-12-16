const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const port = process.env.PORT || 1000
const app = express()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c3dgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
    // Create a collection
    const jobsCollection = client.db('solo-job').collection('jobs')
    // create a get request
    app.get('/jobs', async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.json(result)
    })

    

    // create a post request
    app.post('/add-job', async (req, res) => {
      const job = req.body
      const result = await jobsCollection.insertOne(job);
      res.send(result);
    })

    // my posted jobs
    app.get('/jobs/:email', async (req, res) => {
      const email = req.params.email
      const query = {'buyer.email':email}
      const result = await jobsCollection.find(query).toArray();
      res.json(result)
    })
    // delete job
    app.delete('/jobDelate/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id:new ObjectId (id) }
      const result = jobsCollection.deleteOne(query)
      res.send(result)
    }) 
    //  update job get request
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.findOne(query)
      res.send(result)
    })
    
    //  update job get request
    app.put('/update-job/:id', async (req, res) => {
      const id = req.params.id
      const updated = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedJob={
        $set:updated,
      }
      const result = await jobsCollection.updateOne( filter, updatedJob, options)
      res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
