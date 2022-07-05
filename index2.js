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
        
        
        let {page, database} = query
        if(page == null) {
            page = 1
        }
        const offset= (page-1)*25
        
        const db = database == "pg" ? pgdb : mongo
        
        db.getAll(offset, 25).then(data => {
            const result = data.res
            if(result.length == 0) {
                res.writeHead(400, {
                    'Content-Type' : 'text/html'
                })
                res.write(`<h1>Cant find data in that offset</h1>`)
                res.end()
                return    
            }
            res.writeHead(data.status, {
                    'Content-Type' : 'text/html'
            })
            res.write( `
        <button onclick="window.location.href='/'">Kembali</button>`)
        
                for(let i = 0; i < 6 ; i++) {
                    res.write(`<a href="/list?page=${i+1}"> ${i+1} </a>`)
                }
                res.write(`<br>
                <a href="/list?page=1&database=mongo"> mongodb </a>
                <a href="/list?page=1&database=pg"> postgre </a>
                
                `)
                
                res.write(`<h1 style="text-align:center;margin-top:8%;">Daftar-daftar Mahasiswa</h1>
                <h4 class="list"  style="width:100%;padding-bottom:5rem;height:max-content;margin:auto;overflow-x:auto">
                <table style="width:max-content">
                <thead>
                    <th>Nama</th>
                    <th>NIM</th>
                    <th>Jenis Kelamin</th>
                    <th>Alamat</th>
                    <th>No HP</th>
                    <th>Prodi</th>
                    <th>Kelurahan</th>
                    <th>Kecamatan</th>
                    <th>Kab/Kota</th>
                    <th>Provinis</th>
                    <th>Angkatan</th>
                </thead>
                <tbody style="text-align:center">
        
                `)
                result.forEach(el => {
                res.write(`
                <tr style="color:black;text-decoration:none;" onmouseenter="this.style.cursor='pointer';this.style.color = 'blue'" onmouseleave="this.style.cursor='default';this.style.color = 'black'" onclick="window.location.href='/mahasiswa?nim=${el.nim}&color=black&backcolor=cyan'">
                    <td style="width:10rem;text-align:left">${capFirstLetter(el.nama)}</td>
                    <td width="max-content">${el.nim}</td>
                    <td width="max-content">${el.jenis_kelamin == "L" ? "Laki-laki" : "Perempuan"}</td>
                    <td style="width:max-content;text-align:left;">${capFirstLetter(el.alamat)}</td>
                    <td width="max-content">${el.no_hp}</td>
                    <td width="max-content">${capFirstLetter(el.prodi)}</td>
                    <td width="max-content">${capFirstLetter(el.kelurahan)}</td>
                    <td width="max-content">${capFirstLetter(el.kecamatan)}</td>
                    <td width="max-content">${capFirstLetter(el.kabkota)}</td>
                    <td width="max-content">${capFirstLetter(el.provinsi)}</td>
                    <td width="max-content">${el.angkatan}</td>
                </tr>
                `)
                
            })
            res.end(`
            </h4>
            </tbody>
            </table>
            <script>
            console.log(${data.status})
            console.log(${JSON.stringify(result)})
            </script>
            
            `)
        }).catch(err => {
            console.log(err)
            res.writeHead(500, {
                'Content-Type' : 'text/html'
            })
            res.write(`<h1>500 CONNECTION ERROR</h1>
            <script>
            const err = ${JSON.stringify(err)}
                console.log(err)
            </script>
            `)
            res.end()
        })
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