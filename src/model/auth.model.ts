import { model, Schema } from "mongoose";
import bcrypt from "bcrypt"

const authSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
       type: String,
       required: true,
       match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true})

authSchema.pre('save', async function(next){
    const count = await model('Auth').countDocuments({email: this.email})
    if(count > 0)
        throw next(new Error("Email already Exists"))
    next();
})


authSchema.pre('save', async function(next){
   const encPwd = await bcrypt.hash(this.password.toString(), 12)
   this.password = encPwd
   next();
})

const AuthModel = model('Auth', authSchema)
export default AuthModel

