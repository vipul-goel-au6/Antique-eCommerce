const mongoose=require('mongoose');
const { MONGODB_URI, MONGODB_PASSWORD } = process.env;

mongoose.connect(MONGODB_URI.replace('<password>',MONGODB_PASSWORD),
{useNewUrlParser:true,
useUnifiedTopology:true,
useCreateIndex:true } )
.then(function(){
    console.log("database connected")
})
.catch (err=>{
    console.log(`Error: ${err.message}`)
}
)

module.exports = mongoose;
