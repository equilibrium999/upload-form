const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
    {
        firstName: String,
        lastName: String,
        image: Buffer,
        message: {
            type: String,
            maxlength: 255
        },
        email: String,
        date: Date,
        status: String,
        approved: Boolean
    },
    { collection: 'images' }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Data", DataSchema);