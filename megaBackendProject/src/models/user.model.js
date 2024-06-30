import mongoose ,{Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const jwt = jsonwebtoken();

// To create the user shcema
const userSchema = new Schema(
    {
     username:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        uniqie:true,
        index:true
    },
    fullname:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        uniqie:true,
    },
    avater:{
        type:String // cloudnary
    },
    coverImage:{
        type:String  // cloudnary
    },
    watchHistory:[
     {
      type:Schema.Types.ObjectId,
      ref:'video'
     }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }
},
{timestamps:true}
);


// To brcypt the password
userSchema.pre('save',async function(next){
    if(!this.Modified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

// To compare the bcrypt password and the user password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
};

// To generate jwt token
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {_id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname
        }
        ,process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshTken = async function(){
    return jwt.sign(
        {_id:this._id,
        }
        ,process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

export const User= mongoose.model('User',userSchema);