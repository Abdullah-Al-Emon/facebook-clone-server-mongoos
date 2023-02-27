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

mongoose.connect(mongoUrl, {
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

app.post("/login", (req, res) =>
{
    const { email, password } = req.body
    sign.findOne({ email: email }, (err, user) =>
    {
        if (user) {
            if (password === user.password) {
                res.send({ user: user, message: "Login Successfull" })
            } else {
                res.send({ error: "Password didn't match" })
            }
        } else {
            res.send({ error: "User not registered" })
        }
    })
})

app.get('/allUser', async (req, res) =>
{
    await sign.find()
        .then((friend) =>
        {
            res.json({ friend })
        }).catch(err =>
        {
            console.log(err)
        })
});

app.get("/user/:email", async (req, res) =>
{
    const email = req.params.email;
    await sign.findOne({ email: email })
        .then(user => res.json(user))
        .catch(err => res.send(err))

});


app.get('/users', async (req, res) =>
{
    await sign.find({ _id: req.query.find_id })
        .then(user =>
        {
            res.json({ user })
        }).catch(err =>
        {
            console.log(err)
        })
})



app.post("/register", (req, res) =>
{
    const { first_name, surname, email, password, birth_date, img } = req.body
    sign.findOne({ email: email }, (err, user) =>
    {
        if (user) {
            res.send({ error: "User already registerd" })
        } else {
            const user = new sign({
                first_name,
                surname,
                email,
                password,
                birth_date,
                img
            })
            user.save(err =>
            {
                if (err) {
                    res.send(err)
                } else {
                    res.send({ message: "Successfully Registered, Please login now." })
                }
            })
        }
    })
})

app.put('/register/:id', (req, res) =>
{
    sign.findByIdAndUpdate(req.params.id, {
        $set: {
            first_name: req.body.first_name,
            surname: req.body.surname,
            img: req.body.img,
            cover_Img: req.body.cover_Img,
            student: req.body.student,
            lives_In: req.body.lives_In,
            from: req.body.from,
        }
    }, {
        new: true
    })
        .exec((err, result) =>
        {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

app.put('/addFriend/:id', async (req, res) =>
{
    if (req.body.email !== req.body.email) {
        return res.status(403).send({ message: 'Unmatched email' });
    }

    if (req.params.id !== req.body.id) {
        const sender = await sign.findOne({ _id: req.body.id });
        const receiver = await sign.findOne({ _id: req.params.id });

        // console.log(receiver)
        const exisReceiver = receiver?.followers?.find(
            (r) => r.email === req.body.email
        );

        if (!exisReceiver) {
            sign.findByIdAndUpdate(req.body.id, {
                $push: {
                    requests: {
                        id: receiver._id,
                        first_name: receiver.first_name,
                        surname: receiver?.surname,
                        email: receiver?.email,
                        profileImg: receiver?.img,
                        currentDate: req.body.currentDate,
                        currentTime: req.body.currentTime,
                    },
                    following: {
                        id: receiver._id,
                        first_name: receiver.first_name,
                        surname: receiver?.surname,
                        email: receiver?.email,
                        profileImg: receiver?.img,
                        currentDate: req.body.currentDate,
                        currentTime: req.body.currentTime,
                    },
                }
            }, {
                new: true
            }, (err, result1) =>
            {
                if (err) {
                    return res.status(422).json({ error: err })
                }
                sign.findByIdAndUpdate(req.params.id, {
                    $push: {
                        followers: {
                            id: sender._id,
                            first_name: sender.first_name,
                            surname: sender?.surname,
                            email: sender?.email,
                            profileImg: sender?.img,
                            currentDate: req.body.currentDate,
                            currentTime: req.body.currentTime,
                        },
                    }
                }, {
                    new: true
                }).then(result =>
                {
                    res.json({ result, result1 })
                }).catch(err =>
                {
                    return res.status(422).json({ error: err })
                })
            })
        }
        else {
            return res.send("All ready sent request");
        }

    } else {
        return res.send("You cannot send request yourself....");
    }

})

app.put('/accept/:id', async (req, res) =>
{
    if (req.body.email !== req.body.email) {
        return res.status(403).send({ message: 'Unmatched email' });
    }

    if (req.params.id !== req.body.id) {
        const sender = await sign.findOne({ _id: req.params.id });
        const receiver = await sign.findOne({ _id: req.body.id });

        // console.log(receiver, sender)
        const exisReceiver = receiver?.followers?.find(
            (r) => r.email === sender?.email
        );
        if (exisReceiver) {
            sign.findByIdAndUpdate(req.params.id, {
                $pull: {
                    following: { email: req.body.email },
                    requests: { email: req.body.email }
                },
                $push: {
                    friends: {
                        _id: receiver._id,
                        first_name: receiver.first_name,
                        surname: receiver?.surname,
                        img: receiver?.img,
                        email: receiver?.email,
                    }
                }
            }, {
                new: true
            }).exec((err, result1) =>
            {
                if (err) {
                    return res.status(422).json({ error: err })
                } else {
                    sign.findByIdAndUpdate(req.body.id, {
                        $pull: { followers: { email: sender.email } },
                        $push: {
                            friends: {
                                _id: sender._id,
                                first_name: sender.first_name,
                                surname: sender?.surname,
                                img: sender?.img,
                                email: sender?.email,
                            },
                        }
                    }, {
                        new: true
                    }).then(result =>
                    {
                        res.json({ result1, result })
                    }).catch(err =>
                    {
                        return res.status(422).json({ error: err })
                    })
                }
            })
        } else {
            return res.send("user not exixt");
        }
    } else {
        return res.send("You cannot send request yourself....");
    }
})

app.put('/delete/:id', async (req, res) =>
{
    // console.log('enter')
    if (req.body.email !== req.body.email) {
        return res.status(403).send({ message: 'Unmatched email' });
    }

    if (req.params.id !== req.body.id) {
        const sender = await sign.findOne({ _id: req.params.id });
        const receiver = await sign.findOne({ _id: req.body.id });

        // console.log(receiver)
        const exisReceiver = receiver?.followers?.find(
            (r) => r.email === sender?.email
        );
        if (exisReceiver) {
            sign.findByIdAndUpdate(req.body.id, {
                $pull: {
                    followers: { email: sender.email },
                },
            }, {
                new: true
            }, (err, result1) =>
            {
                if (err) {
                    return res.status(422).json({ error: err })
                }
                sign.findByIdAndUpdate(req.params.id, {
                    $pull: {
                        requests: { email: req.body.email },
                        following: { email: req.body.email }
                    },
                }, {
                    new: true
                }).then(result =>
                {
                    res.json({ result1, result })
                }).catch(err =>
                {
                    return res.status(422).json({ error: err })
                })
            })
        }
        else {
            return res.send("user not exixt");
        }
    } else {
        return res.send("You cannot send request yourself....");
    }
})

app.put('/deleteFrn/:id', async (req, res) =>
{
    if (req.body.email !== req.body.email) {
        return res.status(403).send({ message: 'Unmatched email' });
    }

    if (req.params.id !== req.body.id) {
        const sender = await sign.findOne({ _id: req.params.id });
        const receiver = await sign.findOne({ _id: req.body.id });

        const exisReceiver = receiver?.friends?.find(
            (r) => r.email === sender?.email
        );
        if (exisReceiver) {
            sign.findByIdAndUpdate(req.params.id, {
                $pull: {
                    friends: { email: req.body.email },
                },
            }, {
                new: true
            }).exec((err, result1) =>
            {
                if (err) {
                    return res.status(422).json({ error: err })
                } else {
                    sign.findByIdAndUpdate(req.body.id, {
                        $pull: { friends: { email: sender.email } },
                    }, {
                        new: true
                    }).then(result =>
                    {
                        res.json({ result1, result })
                    }).catch(err =>
                    {
                        return res.status(422).json({ error: err })
                    })
                }
            })
        } else {
            return res.send("user not exixt");
        }
    } else {
        return res.send("You cannot send request yourself....");
    }
})

app.put('/cancelSentRequest/:id', async (req, res) =>
{
    if (req.body.email !== req.body.email) {
        return res.status(403).send({ message: 'Unmatched email' });
    }

    if (req.params.id !== req.body.id) {
        const sender = await sign.findOne({ _id: req.body.id });
        const receiver = await sign.findOne({ _id: req.params.id });

        // console.log(receiver, sender)
        const exisReceiver = receiver?.followers?.find(
            (r) => r.email === req.body?.email
        );
        if (exisReceiver) {
            sign.findByIdAndUpdate(req.body.id, {
                $pull: {
                    following: { email: receiver.email },
                    requests: { email: receiver.email }
                }
            }, {
                new: true
            }).exec((err, result1) =>
            {
                if (err) {
                    return res.status(422).json({ error: err })
                } else {
                    sign.findByIdAndUpdate(req.params.id, {
                        $pull: { followers: { email: req.body.email } },
                    }, {
                        new: true
                    }).then(result =>
                    {
                        res.json({ result1, result })
                    }).catch(err =>
                    {
                        return res.status(422).json({ error: err })
                    })
                }
            })
        } else {
            return res.send("user not exixt");
        }
    } else {
        return res.send("You cannot send request yourself....");
    }
})


app.get('/', async (req, res) =>
{
    res.send('Facebook Clone Server is Runnings')
})

app.listen(port, () =>
{
    console.log(`app listening at port ${port}`)
})