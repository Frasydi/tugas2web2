const mongoose = require('mongoose')
const uri = process.env.DATABASE_Mahasiswa2
const mongo2 = new mongoose.createConnection(uri)


const mahasiswaSchema = new mongoose.Schema({
    nama : {
        type : String,
        required : true,
    },
    nim : {
        type : String,
        required :true,
        
    },
    jurusan : {
        type : String,
        required : true,
    },
    alamat : {
        type : String,
        required : true,
    },
    kelas : {
        type : String,
        required : true,
    },
    kelompok : {
        type : String,
        required : true,
    },
    nilai : {
        type : Object,
        required : true,
        validate : {
            validator : function() {
                try {

                    if(this.nilai == null) {
                        return false
                    }
                    if(typeof this.nilai != 'object') {
                        return false
                    }
                    const keys = Object.keys(this.nilai)
                    if(keys.length < 3) {
                        return false
                    }
                    if(keys[0] != "tugas1" || keys[1] != "tugas2" ||keys[2] != "tugas_final"  ) return false
                    return true
                }catch(err) {
                    return false
                }
            }
        }, message : "Nilai Error"
    }
})



const MahasiswaModel = mongo2.model("mahasiswa2", mahasiswaSchema, "mahasiswa")

async function getAll() {
    console.log("Get All")
    
    try {
        
       const mahasiswa = await MahasiswaModel.find({}).sort({nama:1})
       return {res:mahasiswa,status:200}
    } finally {
    }
}

async function getNIM(nim) {
    try {
        const mahasiswa = await MahasiswaModel.findOne({nim:nim})
        
        if(Object.keys(mahasiswa).length == 0) {
            return {
                status : 404,
                res : "NOT FOUND NIM"
            }
        }
        return {
            status : 200,
            res : "NOT FOUND"
        }

    } finally {
        mongoose.disconnect()
    }
}

async function addMahasiswa(mahasiswa) {
    try {   
        if(mahasiswa == null ||mahasiswa == undefined) {
            return {
                status : 400,
            res : "mahasiswa is empty"
        }
         }
    if(Object.keys(mahasiswa).length == 0) {
        return {
            status : 400,
            res : "MAHASISWA IS NOT INSERTED"
        }
    }
    const mahasiswaBaru = new MahasiswaModel(mahasiswa)
    if(await MahasiswaModel.exists({nim:mahasiswa.nim})) {
        return {
            status : 400,
            res : "NIM ini sudah ditambahkan"
        }
    }
    try {
        mahasiswaBaru.save()
    }catch(err) {
        console.log('Error')
        console.log(err)
        return {
            status : 400,
            res : "Data is not valid"
        }
    }
        
    return {
        status : 201,
        res : "Success added"
    }
    
    } finally {
    }


}


module.exports = {getAll, getNIM, addMahasiswa}