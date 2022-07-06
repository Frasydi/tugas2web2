require('dotenv').config()
const HTTP = require('http')
const url = require("url")
const Anggota = require("./anggota.js")
const port = 4000
const {mongo, pgdb} = require('./database.js')
const {capFirstLetter} = require("./functionJs.js")
const bulan = ["Januari", "Februari", "Maret", "April","Mei","Juni", "Juli", "Agustus","September","Oktober", "November", "Desember" ]
HTTP.createServer(async function(req,res) {
    const {pathname, query} = url.parse(req.url, true)
    
    if(pathname == "/") {
        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })
        res.write(`
       
        <h1 align="center"> Selamat Datang di kelompok 4 web Programming </h1>
        <p align="center">Tekan <a href="/list?page=1&database=pg">ini</a> untuk masuk ke dalam data kelompok</p>
        `)
        res.end()
    } 
    else if(pathname == "/list") {
        
        
        
    } else if( pathname == "/mahasiswa") {
      
        
        const {nim, database } = query
        let {color, backcolor} = query
        if((nim == null)) {
            res.writeHead(400, {
                'Content-Type' : 'text/html'
            })
            res.write("<h1>Terjadi Kesalahan</h1>")
            res.end()
            return
        }
        
        const db = database == "pg" ? pgdb : mongo
        
        if(backcolor == null) {
            backcolor = "cyan"
        }
        if(color == null) {
            color = "black"
        }
        db.getNim(nim).then(data => {    
        console.log(data)
        const result = data.res

        if(data.status == 404) {
                res.writeHead(404, {
                    'Content-Type' : 'text/html',
                    'Access-Control-Allow-Origin': '*'
            })
            res.write(`<h1>Tidak Menemukan Nim yang dimaksud</h1>`)
            res.end()
            return
        }
        res.writeHead(data.status, {
            'Content-Type' : 'text/html'
        })
        
        const foto = `https://simak.unismuh.ac.id/upload/mahasiswa/${nim}.jpg`
        const tanggal_lahir = new Date(result.tanggal_lahir)
        const tanggal = (tanggal_lahir.getDate()< 10 ? `0${tanggal_lahir.getDate()}`:tanggal_lahir.getDate())+' '+bulan[tanggal_lahir.getMonth()]+' '+tanggal_lahir.getFullYear()
        res.write(`
        <style>
        body :not(.back) {
            color : ${color}
        }
        </style>
        <body>
        <button class="back" onclick="window.location.href='/list'">Kembali</button>
        <div style="width:max-content;padding:2rem;margin:auto;background-color:${backcolor}">
        <h3>Nama : ${capFirstLetter(result.nama)}</h3>
        <h3>NIM : ${result.nim}</h3>
        <h3>Alamat : ${capFirstLetter(result.alamat)}</h3>
        <h3>Provinsi : ${capFirstLetter(result.provinsi)}</h3>
        <h3>Kabupaten/Kota : ${capFirstLetter(result.kabkota)}</h3>
        <h3>Angkatan : ${result.angkatan}</h3>
        <h3>TTL : ${capFirstLetter(result.tempat_lahir)}, ${tanggal}</h3>
        <h3>Jenis Kelamin : ${result.jenis_kelamin == "L" ? "Laki-laki" : "Perempuan"}</h3>
        <h3 onclick="window.open('https://wa.me/${result.no_hp}?text=Halo', '_blank')">No HP : ${result.no_hp}</h3>
        <h3 style="float:left">Foto : </h3><img onmouseenter="this.style.cursor = 'pointer'" onmouseleave="this.style.cursor = 'default'" onclick="window.location.href = '${foto}' " width="100" height="100" src="${foto}" alt="${foto}" style="margin-left:1.2rem" />
        </body>
        </div>
        `)

        return res.end()
        }).catch(err => {
            console.log(err)
            res.writeHead(500, {
                'Content-Type' : 'text/html'
            })
            res.write(`<h1>503 Connection ERROR</h1>
            const err = ${JSON.stringify(err)}
            <script>console.log(err)</script>
            `)
            res.end()
            
        })
   
       
        
    } else {
        res.writeHead(404, {
            'Content-Type' : 'text/html'
        })
        res.write("<h1>Tidak menemukan url yang dimaksud</h1>")
        res.end()
    }
    console.log(pathname)
}).listen(port)

console.log("Server berjalan di port "+port)