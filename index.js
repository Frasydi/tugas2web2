const HTTP = require('http')
const url = require("url")
const Anggota = require("./anggota.js")
const port = process.env.PORT||3000
const {mongo, pgdb} = require('./database.js')
const {capFirstLetter} = require("./functionJs.js")
const bulan = ["Januari", "Februari", "Maret", "April","Mei","Juni", "Juli", "Agustus","September","Oktober", "November", "Desember" ]
const db = process.argv.slice(2)[0] == "pg" ? pgdb : mongo
console.log(db, process.argv.slice(2))
HTTP.createServer(async function(req,res) {
    const {pathname, query} = url.parse(req.url, true)
   
    if(pathname == "/") {
        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })
        res.write(`
       
        <h1 align="center"> Selamat Datang di kelompok 4 web Programming </h1>
        <p align="center">Tekan <a href="/list">ini</a> untuk masuk ke dalam data kelompok</p>
        `)
        res.end()
    } 
    else if(pathname == "/list") {
        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })        
        let {page} = query
        if(page == null) {
            page = 1
        }
        const offset= (page-1)*25
        res.write( `
        <button onclick="window.location.href='/'">Kembali</button>`)
        for(let i = 0; i < 6 ; i++) {
            res.write(`<a href="/list?page=${i+1}"> ${i+1} </a>`)
        }
        res.write(`<h1 style="text-align:center;margin-top:8%;">Daftar-daftar Mahasiswa</h1>
        <h4 class="list"  style="padding-bottom:5rem;display:flex;flex:1;flex-direction:column;gap:5%;width:max-content;height:max-content;margin:auto;">
        `)
        try {

            await db("", offset, data => {
                data.forEach(el => {
                    console.log(el.nama)
                res.write(`<div class="li"> <a style="color:black;text-decoration:none;" onmouseenter="this.style.color = 'blue'" onmouseleave="this.style.color = 'black'" href='/mahasiswa?nim=${el.nim}&color=black&backcolor=cyan'>${el.nama}</a></div class="li">`)
            })
            res.end()
        })
        }catch(ex) {
            res.writeHead(404, {
                'Content-Type' : 'text/html'
            })
            res.write(`Time Out`)
            res.end()
        }
        
        
    } else if( pathname == "/mahasiswa") {
      
        
        const {nim } = query
        let {color, backcolor} = query
        if((nim == null)) {
            res.writeHead(400, {
                'Content-Type' : 'text/html'
            })
            res.write("<h1>Terjadi Kesalahan</h1>")
            res.end()
            return
        }

        
        if(backcolor == null) {
            backcolor = "cyan"
        }
        if(color == null) {
            color = "black"
        }
        try {
        await db(nim, 0,data => {

            console.log(data)
            if(data == null) {
                res.writeHead(404, {
                    'Content-Type' : 'text/html'
                })
            res.write(`<h1>Tidak Menemukan Nim yang dimaksud</h1>`)
            res.end()
            return
            }
            res.writeHead(200, {
                'Content-Type' : 'text/html'
            })

        const foto = `https://simak.unismuh.ac.id/upload/mahasiswa/${nim}.jpg`
        const tanggal_lahir = new Date(data.tanggal_lahir)
        const tanggal = (tanggal_lahir.getDate()< 10 ? `0${tanggal_lahir.getDate()}`:tanggal_lahir.getDate())+' '+bulan[tanggal_lahir.getMonth()]+' '+tanggal_lahir.getFullYear()
        res.write(`
        <button onclick="window.location.href='/kelompok'">Kembali</button>
        <div style="width:max-content;padding:2rem;margin:auto;background-color:${backcolor}">
        <h3>Nama : ${capFirstLetter(data.nama)}</h3>
        <h3>NIM : ${data.nim}</h3>
        <h3>Alamat : ${capFirstLetter(data.alamat)}</h3>
        <h3>Provinsi : ${capFirstLetter(data.provinsi)}</h3>
        <h3>Kabupaten/Kota : ${capFirstLetter(data.kabkota)}</h3>
        <h3>Angkatan : ${data.angkatan}</h3>
        <h3>TTL : ${capFirstLetter(data.tempat_lahir)}, ${tanggal}</h3>
        <h3>Jenis Kelamin : ${data.jenis_kelamin == "L" ? "Laki-laki" : "Perempuan"}</h3>
        <h3 onclick="window.open('https://wa.me/${data.no_hp}?text=Halo', '_blank')">No HP : ${data.no_hp}</h3>
        <h3 style="float:left">Foto : </h3><img onmouseenter="this.style.cursor = 'pointer'" onmouseleave="this.style.cursor = 'default'" onclick="window.location.href = '${foto}' " width="100" height="100" src="${foto}" alt="${foto}" style="margin-left:1.2rem" />
        </div>
        
        
        `)
        res.end() 
            
        })
    }catch(ex) {
        res.writeHead(404, {
            'Content-Type' : 'text/html'
        })
        res.write(`<h1>Time Out</h1>`)
        res.end()
    } 
       
        
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