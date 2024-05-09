const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, CommandStartedEvent, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//  midlaeware


app.use(cors({
    origin: ['http://localhost:5174'],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmdvppd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('carDoctor').collection('serviecs');
        const bookingCollection = client.db('carDoctor').collection('bookings');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // auth reletate api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, { expiresIn: '1h' })

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                })
                .send({ success: true })
        })


        // servises reletite api
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };

            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })

        //   bookings   

        app.get('/bookings', async (req, res) => {
            console.log(req.query.email);
            console.log('tok tok token',req.cookies.token);
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find().toArray()
            res.send(result)
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateBooking = req.body;
            console.log(updateBooking);
            const updateDoc = {
                $set: {
                    status: updateBooking.status
                }
            };
            const result = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.send(result)
        })





        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`car Doctor Server is running on port ${port}`);
})







