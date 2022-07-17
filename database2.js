const mongoose = require('mongoose')
const uri = process.env.DATABASE_Mahasiswa2
const mongo2 = mongoose.createConnection(uri, {
}, (err, res) => {
    try {
      if(err) throw err  
      console.log("Connected")
    }catch(err) {   
        console.log("not connected")
    }
})


const mahasiswaSchema = new mongoose.Schema({
    nama : {
        type : String,
        required : true,
    },
    nim : {
        type : String,
        required :true,
        validate : {
            validator : function() {
                try {
                    if(this.nim.length < 12) {
                        return false
                    }
                    return true
                }catch(err) {
                    console.log(err)
                    return false

                }
            }
        }
        
    },
    
    alamat : {
        type : String,
        required : true,
    },
    
    
    nilai : {
        type : Object,
        required : false,
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
    console.log(mongo2.readyState)
    if( mongo2.readyState != 1) {
        return {
            status : 500,
            res : "MONGODB IS NOT CONNECTED"
        }
    }
    const mahasiswa = await MahasiswaModel.find({}).sort({nama:1})
    return {res:mahasiswa,status:200}
    
}

async function getNIM(nim) {
    if( mongo2.readyState != 1) {
        return {
            status : 500,
            res : "MONGODB IS NOT CONNECTED"
        }
    }
        const mahasiswa = await MahasiswaModel.findOne({nim:nim})
        
        if(mahasiswa == null) {
            return {
                status : 404,
                res : "NOT FOUND NIM"
            }
        }
        return {
            status : 200,
            res : mahasiswa
        }

    
}


async function delMah(nim) {
    console.log(mongo2.readyState)
    if( mongo2.readyState != 1) {
        return {
            status : 500,
            res : "MONGODB IS NOT CONNECTED"
        }
    }
    console.log(nim)
    const result = await MahasiswaModel.deleteOne({nim:nim})
    console.log(result)
    if(result.deletedCount <= 0) {
        return {
            status : 404,
            res : "NOT FOUND"
        }
    }
    return {
        status : 200,
        res : "Succesful"
    }
}

async function editMah(nim, mahasiswa) {
    
    if( mongo2.readyState != 1) {
        return {
            status : 500,
            res : "MONGODB IS NOT CONNECTED"
        }
    }

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

    try {
        const result = await MahasiswaModel.findOneAndUpdate({nim:nim}, mahasiswa, {new : true})
        console.log(result)
        
        if(result == null) {
            return {
                status : 404,
                res : "NOT FOUND"
            }
        }

        return {
            status : 200,
            res : "Success"
        }

    }catch(err) {
        console.log(err)
        return {
            status : 400, 
            res : "DATA IS NOT VALID"
        }
    }


}
module.exports = {getAll, getNIM, delMah, editMah}