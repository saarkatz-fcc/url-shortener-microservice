import mongoose from "mongoose";
const { Schema } = mongoose;


const urlRelationSchema = new Schema({
    original_url: {type: URL, required: true, unique: true},
    short_url: {type: String, required: true, unique: true},
    creation: {type: Date, default: Date.now},
    last_access: Date,
    last_stale_check: Date,
    stale: Boolean,
})

const UrlRelation = mongoose.model('UrlRelation', urlRelationSchema);


export default UrlRelation;