const jwt = require('jsonwebtoken');






module.exports.Authenticate = (req,res,next)=>{
   
    const token = req.headers.authorization
    
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const key = process.env.JWT_PRIVATE_KEY
        const decoded = jwt.verify(token, key);
        req.user = decoded; 
        next(); 
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }

}


