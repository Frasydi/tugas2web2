const {MongoClient} = require('mongodb')
const collection = "mahasiswa"
const uri = "mongodb://mahasiswa:if2020@if.unismuh.ac.id:27017/web"

const postgre = {
    host : "data.if.unismuh.ac.id",
    port : 5220,
    database : "web",
    user : "mahasiswa",
    password : "if2020",
    
 }
const {Pool} = require('pg')
const clientPg = new Pool(postgre)
const client = new MongoClient(uri, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}) 
async function postgredb(nim, index ) {
    if(nim === "") {
        index = index == NaN ? 0 : index
        const mahasiswa = await clientPg.query(`SELECT * FROM mahasiswa ORDER BY nama ASC LIMIT 25 OFFSET ${index}`)
        return mahasiswa.rows
    }
    return await clientPg.query(`SELECT * FROM mahasiswa WHERE nim='${nim}'`)
}
async function mongodb(nim, index) {
    if(nim === "") {
        index = index == NaN ? 0 : index

        const mahasiswa = await client.db('web').collection(collection).find({}).skip(index).limit(25).sort({nama : 1}).toArray()
        return mahasiswa
    }
    return await client.db('web').collection(collection).findOne({nim:nim})

    
} 
    


exports.pgdb = postgredb
exports.mongo = mongodb 