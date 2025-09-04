const express = require('express');
const app = express()
require('dotenv').config();
const  {MongoClient, ServerApiVersion, ObjectId} = require('mongodb'); 
const port = process.env.PORT || 3000
const cors = require('cors')
 
app.use(cors())
app.use(express.json())

 
const uri =`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.szermie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run(){
     
    try{
        await client.connect();
        console.log("Connected to Mongodb Atlas");

        const userCollection = client.db('usersdb').collection('users')
        
         app.get('/users', async(req, res)=>{
          const cursor = userCollection.find();
          const result = await cursor.toArray();
          res.send(result);
         })

         //specific item load use findOne(query) for single user:
         app.get('/users/:id', async(req, res)=>{
           const id = req.params.id
           const query = {_id: new ObjectId(id)}
           const result = await userCollection.findOne(query)
           res.send(result)
         })   

        app.post('/users', async(req, res)=>{
          const newUser = req.body
          const result = await userCollection.insertOne(newUser);

          res.send(result);
        })
 

        app.put('/users/:id', async(req, res)=>{
           const id = req.params.id;
           const filter = {_id: new ObjectId(id)}
           const user = req.body
           

           // what we are updating 
           const updatedDoc = {
             $set:{
                   name: user.name,
                  email: user.email
             }
           }

          const options = { upsert: true };
          console.log(user);

          const result = await userCollection.updateOne(filter, updatedDoc, options)
           res.send(result);

        })


        //make sure the method then got it, which task work for it-> delete 
         app.delete('/users/:id', async(req, res)=>{
            const id = req.params.id 
            const query = {_id: new ObjectId(id)}
            const result = await userCollection.deleteOne(query);
            res.send(result);
         }) 


        await client.db('admin').command({ping: 1});
         console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally{

    }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('simple crud server is running')
})
 

app.listen(port, ()=>{
    console.log(`simple CRUD running from server on ${port}`)
})