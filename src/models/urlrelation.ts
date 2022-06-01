import mongoose from "mongoose";
const { Schema } = mongoose;


interface IUrlRelation {
    original_url: URL,
    short_url: string,
    og_url: string,
    creation?: Date,
    last_access?: Date,
}

const urlRelationSchema = new Schema({
    og_url: {type: String, required: true, unique: true},
    short_url: {type: String, required: true, unique: true},
    creation: {type: Date, default: Date.now},
    last_access: Date,
    // last_stale_check: Date,
    // stale: Boolean,
})
urlRelationSchema.virtual('original_url')
    .get(function() {
        return new URL(this.og_url);
    })
    .set(function(url: URL) {
        this.og_url = url.toString();
    })

const UrlRelation = mongoose.model<IUrlRelation>('UrlRelation', urlRelationSchema);

export { IUrlRelation };
export default UrlRelation;