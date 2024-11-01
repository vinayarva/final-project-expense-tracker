const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require("jsonwebtoken")

const User = require("../model/user model")


module.exports.premiumPurchase = async (req, res) => {
    try {
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
  
      const order = await instance.orders.create({
        amount: 50000,
        currency: "INR",
        receipt: "receipt",
        partial_payment: false,
      });
      res.json(order);
    } catch (err) {
      console.log(err);
      res.status(500).json({success:false,message:"Internal Server Error"})
    }
  };


module.exports.verify = (req,res)=>{
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const data = req.user.ID

    const secret = process.env.RAZORPAY_KEY_SECRET; // Replace with your Razorpay secret key

    // Generate signature using order_id and payment_id
    const generatedSignature = crypto.createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

    // Verify that the generated signature matches the received signature
    if (generatedSignature === razorpay_signature) {

        User.update({membership : "premium"},{where: {ID : data}}).then((result) => {
                const key = process.env.JWT_PRIVATE_KEY
                const updatedToken = jwt.sign({ID:data , userName :req.user.userName,membership : "premium"},key)
                 res.status(201).json({ success: true,message: "Payment verified successfully",token :updatedToken });

        }).catch((err) => {
          console.log(err)
        })

        
    } else {
        // Payment verification failed
        res.status(400).json({ message: "Payment verification failed" });
    }
}