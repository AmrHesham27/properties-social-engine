const mongoose = require("mongoose")
const validator = require('validator')
const bcryptjs = require("bcryptjs")
const userSchema = new mongoose.Schema({
    userType:{
        type:String,
        trim:true,
        enum:[ 'client', 'agent'],
        required:true,
    },
    name:{ //
        type:String,
        trim:true,
        required:true
    },
    password:{
        type:String,
        minlength:6,
        trim:true,
        required:true
    },
    email:{ //
        type:String,
        trim:true,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("invalid email format")
        }
    },
    newEmail:{
        type:String,
        trim:true
    }, //
    phoneNumber:{
        type:String,
        trim:true,
        unique:true,
        required:true,
        validate(value){
            if(!validator.isMobilePhone(value,"ar-EG")) throw new Error('invalid phone number')
        }
    }, 
    favourites:[{
        type:String,
        trim:true,
    }],
    notifications:[{
        type:String,
        trim:true,
    }],
    tokens:[{
        token:{
            type:String, 
            required:true
        }
    }],
    otp:{
        type:String,
        trim:true,
        default:Date.now()
    },
    activated:{
        type:Boolean,
        default:false
    }, 
    addresses:[ //
        {
            addrType:{
                type:String,
                required:true
            },
            addrContent:{
                type:String
            },
            isDefault:{
                type:Boolean,
                default:false
            }
        }
    ],
    avatar:{ //
        type:String
    }
},
{timestamps:true}
)
//virtual relation with properties 
userSchema.virtual("agentProps", {
    ref:"Property",
    localField:"_id",
    foreignField:"agentId"
})

//handle response
userSchema.methods.toJSON = function(){
    const user = this.toObject()
    /// what is the dufference between this and this.toObject() ???
    delete user.__v
    delete user.password
    delete user.tokens
    return user
}

//update save
userSchema.pre("save", async function(){
    const user = this
    // if user password was modified hash the new password
    if(user.isModified("password"))
        user.password = await bcryptjs.hash(user.password, 12)
})

//login user
userSchema.statics.loginUser = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user) throw new Error("invalid user email")
    const isValid = await bcryptjs.compare(password, user.password)
    if(!isValid) throw new Error("invalid password")
    return user
}
//generate token
const jwt = require("jsonwebtoken")
userSchema.methods.generateToken = async function(){
    const user = this
    // generate new token every time the user sign in 
    // "123" is secret key should be put in file and read by fs.readFileSync
    const token = jwt.sign({_id:user._id}, "123", { expiresIn: '2h' }) 
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}
const User = mongoose.model("User", userSchema)
module.exports = User