const HTTP = require('http')
const url = require("url")
const Anggota = require("./anggota.js")
const port = 3000

HTTP.createServer(function(req,res) {
    const {pathname, query} = url.parse(req.url, true)

    if(pathname == "/") {
        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })
        res.write(`
       
        <h1 align="center"> Selamat Datang di kelompok 4 web Programming </h1>
        <p align="center">Tekan <a href="/kelompok">ini</a> untuk masuk ke dalam data kelompok</p>
        `)
        res.end()
    } else if(pathname == "/kelompok") {
        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })        
        res.write( `
        <button onclick="window.location.href='/'">Kembali</button>
        <h1 style="text-align:center;margin-top:14%;">Daftar-daftar Mahasiswa</h1>
        <h4 class="list" style="display:flex;flex:1;flex-direction:column;gap:5%;width:max-content;height:max-content;margin:auto;">
        `)

        Anggota.all.forEach(el => {
            console.log(el)
            res.write(`<div class="li"> <a style="color:black;text-decoration:none;" onmouseenter="this.style.color = 'blue'" onmouseleave="this.style.color = 'black'" href='/mahasiswa?nama=${el.nama}&nim=${el.nim}&color=black&backcolor=cyan'>${el.nama}</a></div class="li">`)
        })
        res.write("</h4>")
        res.end()
    } else if( pathname == "/mahasiswa") {
        res.writeHead(200, {
            'Content-Type' : 'text/html'
        })
        const {nama, nim } = query
        let {color, backcolor} = query
        if((nama == null)||(nim == null)) {
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
        
        console.log(nama, nim)
        const foto = `https://simak.unismuh.ac.id/upload/mahasiswa/${nim}.jpg`
        res.write(`
        <button onclick="window.location.href='/kelompok'">Kembali</button>
        <div class="gambar" onmouseenter="this.style.cursor = 'pointer';children[1].style.transform = 'translateY(0%)';this.style.transform = 'scale(105%)'" onmouseleave="children[1].style.transform = 'translateY(200%)';this.style.transform = 'scale(100%)'" style="border-radius:20%;position:relative;margin : auto;width:400px;height:400px;transition: all 0.4s ease;overflow:hidden;">
            <img  onclick="window.location.href = '${foto}' " width="400" height="400" src="${foto}" alt="${foto}"  />
            <h2 style="color:${color};transition: all 0.4s ease;text-align:center;position:absolute;bottom:-5%;transform:translateY(200%);width:100%;height:5rem;background-color:${backcolor}">${nama}</h2>
        </div>
        `)       
        res.end() 
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