import mongoose ,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscription:{
            type:Schema.Types.ObjectId, // one who subscribing
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId, //one to whome subscriber to subscibe
            ref:"User"
        }
});

export const Subscribtion = mongoose.model("Subscribtion",subscriptionSchema)