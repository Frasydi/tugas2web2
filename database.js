const mongoose = require('mongoose')

const uri = process.env.DATABASE_URL
const mongo1 = new mongoose.createConnection(uri, {}, (err, res) => {
    try {
        if(err) throw err
        console.log("Success")
    } catch(err) {
        console.log(err)
    }
}) 


const mongoSchema = new mongoose.Schema({
    nama : String,
    nim : String,
    jenis_kelamin : String,
    alamat : String,
    no_hp : String,
    prodi : String,
    kelurahan : String,
    kecamatan : String,
    kabkota : String,
    provinsi : String,
    angkatan : String,
    tempat_lahir : String,
    tanggal_lahir : Date,
})
const mongoModel = mongo1.model("mahasiswa", mongoSchema, "mahasiswa")
const postgre = {
    host : "data.if.unismuh.ac.id",
    port : 5220,
    database : "web",
    user : "mahasiswa",
    password : "if2020",
    
}
const {Pool} = require('pg')
const clientPg = new Pool(postgre)

const postgredb = {
    async getAll(offset, limit) {
        try {
            await clientPg.connect()
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
            await clientPg.connect()
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
        console.log(mongo1.readyState)
        if(mongo1.readyState != 1) {
            return {
                status : 500,
                res : "MONGODB IS NOT CONNECTED"
            }
        }
            console.log(limit)
            limit = limit == null || limit < 0 ? parseInt(Number.MAX_SAFE_INTEGER.toFixed()) : parseInt(limit)
            offset = offset == null ? 0 : parseInt(offset)
            console.log(limit)
           const mahasiswa =  await mongoModel.find({}).skip(offset).limit(limit).sort({nama : 1})
            return {
                status : 200,
                res : mahasiswa
            }
        
    },
    async getNim(nim){
            if(mongo1.readyState != 1) {
                return {
                    status : 500,
                    res : "MONGODB IS NOT CONNECTED"
                }
            }
            if(nim == null) {
                return {
                    status : 400,
                    res : "NIM IS NOT VALID"
                }
            }
            const result =  await mongoModel.findOne({nim:nim})
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
        
    }
}




exports.pgdb = postgredb
exports.mongo = mongodbs