const router = require('express').Router()
const DataUser = require('../models/User')
const keys = require('../config/keys')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bcrypt = require('bcryptjs')
router.use(cors())
const auth = require('../middleware/auth');

router.post('/',(req, res) => {
    const {name,email,password} = req.body;
  
    DataUser.findOne({email})
    .then(user => {
        if(!user) return res.status(400).json({msg: "user does not exist"})
        if(user) {
            // validate password
            bcrypt.compare(password,user.password)
            .then(isMatch => {
                if(!isMatch) return res.status(400).json({msg: "invalidate credential"})
                jwt.sign(
                    {id: user._id},
                    keys.secretOrKey,
                    {
                      expiresIn: 3600
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
            })
            }
        });
});
// validating the user with token
router.get('/user',auth,(req,res)=> {
  DataUser.findById(req.user.id).select('password').then(user => res.json(user))
});

module.exports = router