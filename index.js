const mongoose = require("mongoose");
const express = require('express')
const cors = require('cors')
const postHandler = require('./routeHandler/postHandler')
// const signHandle = require('./routeHandler/signHandle')
const signInSchema = require('./schemas/signSchema')
const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors())
mongoose.set('strictQuery', false);

const mongoUrl = "mongodb+srv://facebook:9kpIPaeYR9iRuRvt@cluster0.dqljuns.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Successfully"))
.catch((err) => console.log(err))

app.use('/', postHandler)
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
                res.send({user: user, message: "Login Successfull"})
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
            res.send({error: "User already registerd"})
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

app.put('/register/:id',(req,res)=>{
    sign.findByIdAndUpdate(req.params.id,{
        $set: {
            first_name: req.body.first_name,
            surname: req.body.surname,
            img: req.body.img,
            cover_Img: req.body.cover_Img,
            student: req.body.student,
            lives_In: req.body.lives_In,
            from: req.body.from,
        }
    },{
        new:true
    })
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

app.get('/', async (req, res) =>
{
    res.send('Facebook Clone Server is Runnings')
})

app.listen(port, () =>
{
    console.log(`app listening at port ${port}`)
})