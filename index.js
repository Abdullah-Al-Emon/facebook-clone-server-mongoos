const express = require('express')
const mongoose = require("mongoose");
const cors = require('cors')
const postHandler = require('./routeHandler/postHandler')
const port = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cors())
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/post',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Successfully"))
.catch((err) => console.log(err))

app.use('/post', postHandler)

function errorHandler(err, req, res, next)
{
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
}

app.get('/', async (req, res) =>
{
    res.send('Facebook Clone Server is Running')
})

app.listen(port, () =>
{
    console.log("app listening at port 4000")
})