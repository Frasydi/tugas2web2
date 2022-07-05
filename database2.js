const mongoose = require('mongoose')
const uri = process.env.DATABASE_Mahasiswa2
mongoose.connect(uri, {
    useNewUrlParser: true
})
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
                if(this.nilai == null) {
                    return false
                }
                if(typeof this.nilai != 'object') {
                    return false
                }
                if(this.nilai.tugas1==null||this.nilai.tugas2==null||this.nilai.tugas_final==null) {
                    return false
                }
                return true
            }
        }
    }
})



const MahasiswaModel = mongoose.model("mahasiswa2", mahasiswaSchema, "mahasiswa")

async function getAll() {
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