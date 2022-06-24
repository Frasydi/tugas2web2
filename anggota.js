const {MongoClient} = require('mongodb')
const client = new MongoClient('mongodb+srv://Fachri:Shirochan@cluster0.r84gb.mongodb.net/test', {
    useNewUrlParser : true,
    useUnifiedTopology : true
})

const getAll = async() => {
    const hasil = []
    await client.db('Tugas').collection('Web2').find({}).forEach(el => {
        hasil.push(el)
    })
    console.log(hasil)
    return hasil
}
exports.getAll = getAll