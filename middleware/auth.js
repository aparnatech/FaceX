const key  = require('../config/keys'); 
const jwt  = require('jsonwebtoken'); 
function auth(req, res, next) {
    const token = req.header('x-auth-token')
    // check for token
    if(!token) res.status(401).json({msg:"no token, authorization denied"})
    try {
        const decoded = jwt.verify(token, key.secretOrKey)
        req.user= decoded;
        
        next();
    } catch(e) {
        res.status(400).json({msg:"Token is not valid"})
    }
}
module.exports = auth