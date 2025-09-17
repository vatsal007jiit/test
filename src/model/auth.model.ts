import { model, Schema } from "mongoose";
import bcrypt from "bcrypt"

// ReDoS-safe email validation function
const isValidEmail = (email: string): boolean => {
    // Check length first to prevent ReDoS
    if (!email || email.length > 254) return false;
    
    // Simple regex without nested quantifiers
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

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
       maxlength: 254, // RFC 5321 limit
       validate: {
           validator: isValidEmail,
           message: 'Please enter a valid email'
       }
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

