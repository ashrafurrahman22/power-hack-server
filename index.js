const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u36wy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run (){
    try{
        await client.connect();
        const paymentCollection = client.db('powerHack').collection('payment');

        app.get('/payment', async (req, res)=>{

            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = paymentCollection.find(query);
            let payments;
            if(page || size){
                payments = await cursor.skip(page*size).toArray();
            }
            else {
                payments = await cursor.toArray();
            }
            // const payments = await cursor.toArray();
            res.send(payments);
        });

        // pagination APi
        app.get('/paymentCount', async(req, res)=>{
            const count = await paymentCollection.estimatedDocumentCount();
            res.send({count});
        })

        // catch single item
        app.get('/payment/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const payment = await paymentCollection.findOne(query);
            res.send(payment);
        });

        // add new item
            // post 
            app.post('/payment', async(req, res)=>{
                const newPayment = req.body;
                const result = await paymentCollection.insertOne(newPayment);
                res.send(result);
            });

        // Update
        app.put('/payment/:id', async(req, res)=>{
            const id = req.params.id;
            const updatedPayment = req.body;
            const filter = {_id : ObjectId(id)};
            const options = { upsert : true };
            const updatedDoc = {
                $set : {
                   fullName : updatedPayment.name,
                   email : updatedPayment.email,
                   phone : updatedPayment.phone,
                   paidAmount : updatedPayment.paidAmount
                }
            };
            const result = await paymentCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

         // Delete
         app.delete('/payment/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await paymentCollection.deleteOne(query);
            res.send(result);
        });



    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send("power-hack server is running")
});

app.listen(port, ()=>{
    console.log("power-hack server is running on port", port);
})