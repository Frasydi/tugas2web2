const {MongoClient} = require('mongodb')
const collection = "mahasiswa"
const uri = process.env.DATABASE_URL

const postgre = {
    host : "data.if.unismuh.ac.id",
    port : 5220,
    database : "web",
    user : "mahasiswa",
    password : "if2020",
    
 }
const {Pool} = require('pg')
const clientPg = new Pool(postgre)
const client = new MongoClient(uri) 

const postgredb = {
    async getAll(offset, limit) {
        try {
            clientPg.connect()
            let ekstra = ""
            if(limit != null || limit> 0) {
                ekstra = "LIMIT "+limit
            }
            
            const mahasiswa = await clientPg.query(`SELECT * FROM mahasiswa ORDER BY nama ASC ${ekstra} OFFSET ${offset}`)
            return {status : 200,res : mahasiswa.rows}
        } finally {
            
        }
    },
    async getNim(nim) {
        try {
            clientPg.connect()
            if(nim == null) {
                return {
                    status : 400,
                    res : "NIM IS NOT VALID"
                }
            }
            const result = await clientPg.query(`SELECT * FROM mahasiswa WHERE nim='${nim}'`)
            if(result.rows.length == 0) {
                return {
                    status : 404,
                    res : "NOT FOUND"
                }
            }
            return {
                status : 200,
                res : result.rows[0]
            }
        } finally {

        }
    }
}
const mongodbs = {
    async getAll(offset, limit) {
        try {
            await client.connect()
            console.log(limit)
            limit = limit == null || limit < 0 ? parseInt(Number.MAX_SAFE_INTEGER.toFixed()) : parseInt(limit)
            offset = offset == null ? 0 : parseInt(offset)
            console.log(limit)
           const mahasiswa = await client.db('web').collection(collection).find({}).skip(offset).limit(limit).sort({nama : 1}).toArray()    
            return {
                status : 200,
                res : mahasiswa
            }
        }finally {
            await client.close()
        }
    },
    async getNim(nim){
        try {
            await client.connect()
            if(nim == null) {
                return {
                    status : 400,
                    res : "NIM IS NOT VALID"
                }
            }
            const result =  await client.db('web').collection(collection).findOne({nim : nim})
            if(result == null) {
                return {
                    status : 404,
                    res : "NOT FOUND"
                }
            }
            return {
                status : 200,
                res : result
            }
        }finally {
            await client.close()
        }
    }
}




exports.pgdb = postgredb
exports.mongo = mongodbs