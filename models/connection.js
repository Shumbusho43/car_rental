//function for connecting to mongodb database
var mongoose = require('mongoose');
const dbConnection = async() => {
    try {
        mongoose.set('strictQuery', false)
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB online');
    } catch (error) {
        console.log(error);
        throw new Error('Unable to connect to database');
    }
}
module.exports = {
    dbConnection
}