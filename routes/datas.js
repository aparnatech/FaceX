const router = require('express').Router()
const DataUser = require('../models/User')
const keys = require('../config/keys')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
router.use(cors())
const auth = require('../middleware/auth');
// get api
router.get('/',(req, res) => {
    DataUser.find()
    .then(data => res.json(userdata))
    .catch(err => res.status(400).json('Error: ' + err));
});
// post api
router.post('/register',( req, res) => {   
    const userdata = {
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        age: req.body.age,
        role: req.body.role
    }
    if(!userdata.name && !userdata.email && !userdata.password && !userdata.age && !userdata.role) {
      res.send({success: false, message:'Error:name must not be empty'})
    }
    const email=userdata.email;
    DataUser.findOne({email})
    .then(user => {
        if(!user) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(userdata.password, salt, (err, hash) => {
                  if(err) {
                    throw err
                  } 
                  userdata.password = hash;
                  DataUser
                    .create(userdata)
                    .then(user => 
                      jwt.sign(
                        {id: user._id},
                        keys.secretOrKey,
                        {
                          expiresIn: 3600
                        },
                        (err, token) => {
                          if(err) throw err;
                          res.json({
                            success: true,
                            token: token,
                            user: {
                                _id: user.id,
                                name: user.name,
                                email: user.email,
                                age: user.age,
                                role: user.role
                            }
                          });
                        }
                      )
                    )
                    .catch(err => console.log(err));
                });
              
              });
            }
        });
});
router.post('/login',auth,(req, res) => {
    
    if(!req.body.email) {
      res.send({success: false, message:'Error:email must not be empty'})
    }
    if(!req.body.password) {
      res.send({success: false, message:'Error:password must not be empty'})
    }
       DataUser.findOne({
          email: req.body.email
      })
      .then(user => {
          if(user) {
              if(bcrypt.compareSync(req.body.password, user.password)) {
                  const payload = {
                      _id: user._id,
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      age: user.age
                  }
                  jwt.sign(
                      payload,
                      keys.secretOrKey,
                      {
                        expiresIn: 36000
                      },
                      (err, token) => {
                        res.json({
                          
                          success: true,
                          token: token,
                          user: {
                              _id: user._id,
                              name: user.name,
                              email: user.email,
                              age: user.age,
                              role: user.role
                          }
                        });
                      }
                    );
                  } else {
                    return res
                      .status(400)
                      .json({ passwordincorrect: "Password incorrect" });
                  }
              } else {
                res.send("register please!!!");
              }
      }).catch(err => {
          res.send('error' + err);
      });
  });
 router.delete('/delete/:id', auth,(req, res) => {
    DataUser.findByIdAndDelete(req.params.id).then((users) => res.json(users)
  )});
  mongoose.set('useFindAndModify', false);
  router.post('/updating/:id', auth,function (req, res) {
    const role = req.body.role;
    const age = req.body.age;
    const name = req.body.name;
    const email =  req.body.email;
    DataUser.findOneAndUpdate(req.params.id, { "$set": { "role": role, "age": age, "name": name , "email": email}}).exec(function(err, data){
          if(err) {
              res.status(500).send(err);
          } else {
              res.status(200).send(data);
          }
        });
    });


module.exports = router