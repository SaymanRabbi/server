const express = require('express')
const app = express()
const port = process.env.PORT|| 5000
const cors = require('cors');
let bcrypt = require('bcryptjs');
app.use(cors());
app.use(express.json());
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iucsa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//hasing password
async function run() {
    try {
      await client.connect();
        const Candidatelist = client.db("Candidatelist").collection("Candidate");
        const UsersList = client.db("UsersList").collection("User");
        app.post('/user', async (req, res) => {
          const data = req.body;
          try {
            const salt = await bcrypt.genSalt()
            const hashPassword = await bcrypt.hash(data.password,salt)
            const exituser = await UsersList.findOne({ email: data.email })
            if (exituser) {
              return res.status(422).messages({error:"Email Aready Exits"})
            }
             const user = {email:data.email,password:hashPassword,phone:data.phone}
             const result = await UsersList.insertOne(user)
             res.send({messages:'success'})
          }
          catch (err){
            console.log(err);
            }
        })
      app.get('/candidate', async (req, res) => {
        const result = await Candidatelist.find({}).toArray()
        res.send(result)
      })
      app.post('/candidate', async (req, res) => {
        const data = req.body
        const result = await Candidatelist.insertOne(data)
        res.send({messages:"sucess"})
      })
      app.delete('/candidate', async (req, res) => {
        const id = req.query.id
        const filter = { _id: ObjectId(id) }
        const result = await Candidatelist.deleteOne(filter)
        res.send(result)

      })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})