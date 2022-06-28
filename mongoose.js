const {MongoClient} = require('mongodb')
const collection = "mahasiswa"
const uri = "mongodb://mahasiswa:if2020@if.unismuh.ac.id:27017/web"
const client = new MongoClient(uri, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}) 

client.db('web').collection('mahasiswa').find({}).limit(100).toArray((err, res) => {
    console.log(res)
})

