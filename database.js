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
async function postgredb(nim, index, next ) {
    if(nim === "") {
        index = index == NaN ? 0 : index
        clientPg.query(`SELECT * FROM mahasiswa ORDER BY nama ASC LIMIT 25 OFFSET ${index}`, (err, res) => {
            if(err) throw err
            console.log(res.rowCount)
            next(res.rows, res.rowCount)
        })  
        return  
    }
    clientPg.query(`SELECT * FROM mahasiswa WHERE nim='${nim}'`, (err, res) => {
        if(err) throw err
        console.log(res)
        next(res.rows[0])
    })
}
async function mongodb(nim, index,next, ) {
    if(nim === "") {
        index = index == NaN ? 0 : index

        client.db('web').collection(collection).find({}).skip(index).limit(100).sort({nama : 1}).toArray((err, res) => {
            if(err) throw err
            next(res)
        })
        return
    }
    client.db('web').collection(collection).findOne({nim:nim}, (err, res) => {
        if(err) throw err
        next(res)
    })
    
} 
    


exports.pgdb = postgredb
exports.mongo = mongodb 