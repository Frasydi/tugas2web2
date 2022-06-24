const {MongoClient} = require('mongodb')
const collection = "mahasiswa"
const uri = "mongodb://mahasiswa:if2020@if.unismuh.ac.id:27017/web"

const client = new MongoClient(uri, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}) 

async function main(nim, next) {
    client.db('web').collection(collection).findOne({nim:nim}, (err, res) => {
        if(err) throw err
        next(res)
    })
    
} 
    



module.exports = main