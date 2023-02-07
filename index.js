const express = require('express')
const mongoose = require("mongoose");
const cors = require('cors')
const postHandler = require('./routeHandler/postHandler')
// const signHandle = require('./routeHandler/signHandle')
const signInSchema = require('./schemas/signSchema')
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
// app.use('/signUp', signHandle)

function errorHandler(err, req, res, next)
{
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
}

const sign = new mongoose.model('sign', signInSchema)

app.post("/login", (req, res)=> {
    const { email, password} = req.body
    sign.findOne({ email: email}, (err, user) => {
        if(user){
            if(password === user.password ) {
                res.send({message: "Login Successfull", user: user})
            } else {
                res.send({ error: "Password didn't match"})
            }
        } else {
            res.send({error: "User not registered"})
        }
    })
}) 

app.post("/register", (req, res)=> {
    const { first_name, surname, email, password, birth_date, img} = req.body
    sign.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registerd"})
        } else {
            const user = new sign({
                first_name,
                surname,
                email,
                password,
                birth_date,
                img
            })
            user.save(err => {
                if(err) {
                    res.send(err)
                } else {
                    res.send( { message: "Successfully Registered, Please login now." })
                }
            })
        }
    })
    
}) 

app.get('/', async (req, res) =>
{
    res.send('Facebook Clone Server is Running')
})

app.listen(port, () =>
{
    console.log("app listening at port 4000")
})