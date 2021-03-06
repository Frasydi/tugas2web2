require('dotenv').config()
const HTTP = require('http')
const url = require("url")
const port = process.env.PORT||3000
const {mongo, pgdb} = require('./database.js')
const db = process.argv[2] == "pg" ? pgdb : mongo
const mahasiswa = require('./database2.js')
const {capFirstLetter} = require("./functionJs.js")
const bulan = ["Januari", "Februari", "Maret", "April","Mei","Juni", "Juli", "Agustus","September","Oktober", "November", "Desember" ]

const server = HTTP.createServer(async (req,res) => {
const urls = url.parse(req.url, true)
const {query, pathname} = urls
const paths = pathname.slice(1).split('/')


    console.log(paths)
    if(req.method == "GET") {
        if(pathname == "/") {
            res.writeHead(200, {
                'Content-Type' : "text/plain"
            })
            res.write(`Hello World😆
            ${req.url}
            `)
            res.end()
        } else if(pathname == "/web/list2") {
            mahasiswa.getAll().then(data => {
                console.log(data.res)
               
                if(data.res.length == 0 || data.status >= 400 ) {
                    res.writeHead(data.status, {
                        'Content-Type' : 'text/html'
                    })
                    res.end(`<body>
                    <a href="/web">Kembali ke halaman utama</a><br>
                <a href="/web/add">Ke menu tambahkan siswa</a>

                    <h1>Data kosong</h1>
                    
                    </body>`)
                    return
                }
                
                res.writeHead(data.status, {
                    'Content-Type' : 'text/html'
                })
                let hasil =""
                data.res.forEach(el => {
                    hasil += `<li onclick="window.location.href = '/web/mahasiswa2/${el.nim}'">${el.nama}</li>`
                })
                res.end(`
                <style>
                     
                    li:hover {
                        cursor : pointer;
                        color : blue
                    }
                </style>
                <body>
                <a href="/web">Kembali</a><br>
                <a href="/web/add">Ke menu tambahkan siswa</a>
                <h1>List mahasiswa</h1>
                <ol>
                    ${hasil}
                </ol>   
                </body>
                
                `)

            }).catch(err => {
                console.log(err)
                res.writeHead(500, {
                    'Content-Type' : 'text/html'
                })
                res.end(`<h1>500 Internal Server Error</h1>`)
            })
        } else if(pathname == "/web/add") {
            res.writeHead(200, {
                'Content-Type' : "text/html"
            })
            res.end(`
            <body>
            <a href="/web/list2">Kembali</a>
                <h1>Tambahkan Siswa</h1>
        <form>
            <label for="nama">Nama : </label>
            <input type="text" id="nama"><br>
            <label for="nim">nim : </label>
            <input type="text" id="nim"><br>
            <label for="alamat">alamat : </label>
            <input type="text" id="alamat"><br>
            <label for="kelompok">kelompok : </label>
            <input type="text" id="kelompok"><br>
            <label for="kelas">kelas : </label>
            <input type="text" id="kelas"><br>
            <label for="jurusan">jurusan : </label>
            <input type="text" id="jurusan"><br>
            <p>Tugas : </p><br>
            <label for="tugas1"> Tugas1 : </label>
            <input type="number" min=0 max=100 id="tugas1"><br>
            <label for="tugas2"> Tugas2 : </label>
            <input type="number" min=0 max=100 id="tugas2"><br>
            <label for="tugas_final"> Tugas Final : </label>
            <input type="number" min=0 max=100 id="tugas_final">
            <button type="submit">Tambah</button>
        </form>
        <div class="app">
        
        </div>
            <script>
            const app= document.querySelector(".app")
            const form = document.querySelector("form")
            form.addEventListener('submit', (el) => {
                console.log(app)
                el.preventDefault()
                app.innerHTML = "<h1>Menunggu</h1>"
                const mahasiswa = {
                    nama : el.target[0].value,
                    nim : el.target[1].value,
                    alamat : el.target[2].value,
                    kelompok : el.target[3].value,
                    kelas : el.target[4].value,
                    jurusan : el.target[5].value,
                    nilai : {
                        tugas1 : el.target[6].value,
                        tugas2 : el.target[7].value,
                        tugas_final : el.target[8].value
                    }
                }
                fetch("https://tugas2web2.herokuapp.com/mahasiswa2/upload", {
                    'method':'POST',
                    'mode' : 'cors',
                    'body' : JSON.stringify(mahasiswa),
                    'headers' : {'authorization' : "Frasydi"}
                }).then(
                    async (res) => {
                        if(res.status >= 400) {
                            const text = await res.text()
                            app.innerHTML =  "<h1>"+text+"</h1>"
                            return
                        }
                        app.innerHTML = "<h1>Berhasil ditambahkan</h1>"
                        window.location.href = "/web/list2"
                    }
                ).catch(err => {
                    console.log(err)
                    app.innerHTML = "<h1>"+err+"</h1>"
                })
            })
            </script>
            </body>
            `)
        } else if(paths[0] == "web" && paths[1] == "input") {
            const nim = paths[2]
            if(nim == null || typeof nim != 'string' || nim == "") {
                res.writeHead(400, {
                    'Content-Type' : 'text/html'
                })
                res.end(`
                <h1>NIM Cant be Empty</h1>
                <a href="/web/list2">Kembali</a>
                `)
                return
        }
            mahasiswa.getNIM(nim).then(data => {
                console.log(nim)
            if(data.status >= 400) {
                res.writeHead(data.status, {
                    'Content-Type' : 'text/html'
                })
                res.end(`
                <h1>${data.res}</h1>
                <a href="/web/list2">Kembali</a>
                `)
                return
            }
            const result = data.res
            res.writeHead(200, {
                'Content-Type' : "text/html"
            })
            if(result.nilai == null) {
                result['nilai'] = {
                    tugas1:0,
                    tugas2:0,
                    tugas_final:0
                }
            }
            res.end(`
            <body>
            <a href="/web/list2">Kembali</a>
                <h1>Tambahkan Siswa</h1>
        <form>
            <label for="tugas1">Tugas 1 : </label>
            <input type="text" value="${result.nilai.tugas1}" id="tugas1" required><br>
            <label for="tugas2">Tugas 2 : </label>
            <input type="text" value="${result.nilai.tugas2}" id="tugas2" required><br>
            <label for="tugasfinal">Tugas Final : </label>
            <input type="text" value="${result.nilai.tugas_final}" id="tugasfinal" required><br>
            <button type="submit">Update</button>
        </form>

        <div class="app">
        </div>
            <script>
            const app= document.querySelector(".app")
            const form = document.querySelector("form")
            form.addEventListener('submit', (el) => {
                console.log(app)
                el.preventDefault()
                app.innerHTML = "<h1>Menunggu</h1>"
                const mahasiswa = {
                    nilai : {
                        tugas1 : el.target[0].value,
                        tugas2 : el.target[1].value,
                        tugas_final : el.target[2].value
                    }
                    
                }
                fetch("https://tugas2web2.herokuapp.com/mahasiswa2/edit/${result.nim}", {
                    'method':'PUT',
                    'mode' : 'cors',
                    'body' : JSON.stringify(mahasiswa),
                    'headers' : {'authorization' : "Frasydi"}
                }).then(
                    async (res) => {
                        if(res.status >= 400) {
                            const text = await res.text()
                            app.innerHTML =  "<h1>"+text+"</h1>"
                            return
                        }
                        app.innerHTML = "<h1>Berhasil diupdate</h1>"
                        window.location.href = "/web/list2"

                    }
                ).catch(err => {
                    console.log(err)
                    app.innerHTML = "<h1>"+err+"</h1>"
                })
            })
            </script>
            </body>
            `)
        }).catch(err => {
            console.log(err)
            res.writeHead(400, {
                'Content-Type' : 'text/html'
            })
            res.end(`
            <h1>500 INTERNAL SERVER ERROR</h1>
            <a href="/web/list2">Kembali</a>
            `)
        })
            
        }
        else if(paths[0] == "web" && paths[1] == "edit") {
            const nim = paths[2]
            if(nim == null || typeof nim != 'string' || nim == "") {
                res.writeHead(400, {
                    'Content-Type' : 'text/html'
                })
                res.end(`
                <h1>NIM Cant be Empty</h1>
                <a href="/web/list2">Kembali</a>
                `)
                return
            }
            mahasiswa.getNIM(nim).then(data => {
                console.log(nim)
            if(data.status >= 400) {
                res.writeHead(data.status, {
                    'Content-Type' : 'text/html'
                })
                res.end(`
                <h1>${data.res}</h1>
                <a href="/web/list2">Kembali</a>
                `)
                return
            }
            const result = data.res
            res.writeHead(200, {
                'Content-Type' : "text/html"
            })
            if(result.nilai == null) {
                result['nilai'] = {
                    tugas1:0,
                    tugas2:0,
                    tugas_final:0
                }
            }
            res.end(`
            <body>
            <a href="/web/list2">Kembali</a>
                <h1>Tambahkan Siswa</h1>
        <form>
            <label for="nama">Nama : </label>
            <input type="text" value="${result.nama}" id="nama" required><br>
            <label for="nim">nim : </label>
            <input type="text" value="${result.nim}" id="nim" required><br>
            <label for="kelompok">kelompok : </label>
            <input type="number" value="${result.kelompok == null?0:result.kelompok}" id="kelompok" required><br>
            <label for="kelas">kelas : </label>
            <input type="text" value="${result.kelas == null ? "" : result.kelompok}" id="kelas" required><br>
            
            <button type="submit">Update</button>
        </form>
        <div class="app">
        
        </div>
            <script>
            const app= document.querySelector(".app")
            const form = document.querySelector("form")
            form.addEventListener('submit', (el) => {
                console.log(app)
                el.preventDefault()
                app.innerHTML = "<h1>Menunggu</h1>"
                const mahasiswa = {
                    nama : el.target[0].value,
                    nim : el.target[1].value,
                    kelompok: el.target[2].value,
                    kelas: el.target[3].value
                }
                fetch("https://tugas2web2.herokuapp.com/mahasiswa2/edit/${result.nim}", {
                    'method':'PUT',
                    'mode' : 'cors',
                    'body' : JSON.stringify(mahasiswa),
                    'headers' : {'authorization' : "Frasydi"}
                }).then(
                    async (res) => {
                        if(res.status >= 400) {
                            const text = await res.text()
                            app.innerHTML =  "<h1>"+text+"</h1>"
                            return
                        }
                        app.innerHTML = "<h1>Berhasil diupdate</h1>"
                        window.location.href = "/web/list2"

                    }
                ).catch(err => {
                    console.log(err)
                    app.innerHTML = "<h1>"+err+"</h1>"
                })
            })
            </script>
            </body>
            `)
        }).catch(err => {
            console.log(err)
            res.writeHead(400, {
                'Content-Type' : 'text/html'
            })
            res.end(`
            <h1>500 INTERNAL SERVER ERROR</h1>
            <a href="/web/list2">Kembali</a>
            `)
        })
            
        }
        else if(paths[0] == "web" && paths[1] == "mahasiswa2" ) {
        const nim = paths[2]
        
        if(nim == null || nim == "" || typeof nim != 'string') {
            res.writeHead(400, {
                'Content-Type' : 'text/html'
            })
            res.end(`<h1>NIM is not valid or empty</h1>`)
            return
        } 

        mahasiswa.getNIM(nim).then(result => {
            if(result.status >= 400) {
                res.writeHead(result.status, {
                    'Content-Type' : 'text/html'      
                })
                res.end(`<h1>${result.res}</h1>`)
                return
            }
            const data = result.res
            if(data.nilai == null) {
                data["nilai"] = {
                    tugas1 : 0,
                    tugas2 : 0,
                    tugas_final : 0
                }
            }
            res.end(`
            <style>
            .card {
                background-color : cyan;
                margin-inline : auto;
                width : 50%;
                height : max-content;
                display : flex;
            }

            .text {
                margin : 4;
                font-weight : bold;
                font-size : x-large;
            }

            .text>.list:not(:first-child) {
                margin-top : 0.5rem;
            }
            .gambar {
                height : max-content;
                margin-top : auto;
                margin-bottom : auto;
            }
            </style>
            <body>
                <a href="/web/list2">Kembali</a>
                <a href="/web/edit/${data.nim}">Edit</a>
                <a href="/web/input/${data.nim}">Input</a>
                
                <div class="card">
                    <div class="gambar">
                    <img width=200 height=200 src="https://simak.unismuh.ac.id/upload/mahasiswa/${nim}.jpg">
                    </div>
                    <div class="text">
                        <div class="list"> Nama : ${data.nama}</div>
                        <div class="list"> NIM : ${data.nim}</div>
                        <div class="list"> Alamat : ${data.alamat}</div>
                        <div class="list"> Kelompok : ${data.kelompok == null?"belum diketahui":data.kelompok}</div>
                        <div class="list"> Kelas : ${data.kelas == null?"belum diketahui":data.kelompok}</div>
                        <div class="list"> Nilai : <br>Tugas 1 : ${data.nilai.tugas1}, <br> Tugas 2 : ${data.nilai.tugas2}, <br> Tugas Final : ${data.nilai.tugas_final} 
                        </div>
                    </div>
                    </div>
                <script>
                const deletes = document.querySelector(".delete")
                deletes.addEventListener('click', deletess)
                
                </script>
            </body>
            
            `)
            
        }).catch(err => {
            console.log(err)
            res.writeHead(500, {
                'Content-Type' : 'text/html'      
            })
            res.end(`<h1>INTERNAL SERVER ERROR</h1>`)
        })
        
        
        }
        
        else if(pathname == "/web") {
            res.writeHead(200, {
                'Content-Type' : 'text/html'
            })
            res.write(`
           
            <h1 align="center"> Selamat Datang di kelompok 4 web Programming </h1>
            <p align="center">Tekan <a href="/web/list?page=1&database=mongo">ini</a> untuk masuk ke dalam data mahasiswa</p>
            <p align="center">Tekan <a href="/web/list2">ini</a> untuk masuk ke dalam data kelompok</p>
            `)
            res.end()
        }else if(pathname == "/web/list") {
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
                    res.write(`<a href="/web/list?page=${i+1}"> ${i+1} </a>`)
                }
                res.write(`<br>
                <a href="/web/list?page=1&database=mongo"> mongodb </a>
                <a href="/web/list?page=1&database=pg"> postgre </a>
                
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
                <tr style="color:black;text-decoration:none;" onmouseenter="this.style.cursor='pointer';this.style.color = 'blue'" onmouseleave="this.style.cursor='default';this.style.color = 'black'" onclick="window.location.href='/web/nim/${el.nim}?color=black&backcolor=cyan'">
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
        } else if(paths[0] == "web" && paths[1] == "nim") {
            const {database } = query
            const nim = paths[2]
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
        console.log(result.nama)
        console.log(result)
        res.write(`
        <style>
        body :not(.back) {
            color : ${color}
        }
        </style>
        <body>
        <button class="back" onclick="window.location.href='/web/list'">Kembali</button>
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
        <script>
        console.log(${JSON.stringify(result)})
        </script>
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
   
        }
        
        
        else if(pathname == "/mahasiswa2/all") {
            mahasiswa.getAll().then(data => {
                const {status} = data
                const isClientError =  typeof data.res == 'string'   
                res.writeHead(status, {
                    'Content-Type' : isClientError ? 'text/html' : 'application/json',
                    'Access-Control-Allow-Origin': '*'
                })
                res.end( !isClientError ? JSON.stringify(data.res, null, 2) : data.res)
                
            }).catch(err => {
                console.log(err)
                res.writeHead(500, {
                    'Content-Type' : 'text/plain'
                })
                res.end(`500 Error`)
            })
        } else if(paths[0] == "mahasiswa2" && paths[1] == "nim") {
            console.log(pathname)
            const nim = paths[2]
            
            if(nim == null||nim=="") {
                res.writeHead(400, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                })
                res.write(`Error`)
                res.end()
                return
            }
            mahasiswa.getNIM(nim).then(data => {
                const isClientError = !(typeof data.res == "object")    
                console.log(isClientError)
                res.writeHead(data.status, {
                    'Content-Type' : isClientError ? 'text/plain' : 'application/json',
                    'Access-Control-Allow-Origin': '*'
                })
                res.end( !isClientError ? JSON.stringify(data.res, null, 2) : data.res)
            }).catch(err => {
                res.writeHead(500, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                })
                res.end(`Error`)
                console.log(err)
            })
        }
        else if(pathname == "/mahasiswa/all") {
            let {offset, limit} = query
            
            db.getAll(offset, limit).then(dat => {
                const isClientError =  typeof dat.res == 'string'   
                console.log(isClientError) 
                res.writeHead(dat.status, {
                    'Content-Type' : isClientError ? 'text/html' : 'application/json',
                    'Access-Control-Allow-Origin': '*'
                })
                res.end(isClientError ? dat.res :JSON.stringify(dat.res, null, 2))

            }).catch(err => {
                res.writeHead(500, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                })
                res.end("Error")
                console.log(err)
            })
        } else if(paths[0] == "mahasiswa" && paths[1] == "nim") {
            console.log(pathname)
            const nim = paths[2]
            
            if(nim == null || nim == "") {
                res.writeHead(400, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                })
                res.write(`Error`)
                res.end()
                return
            }
            db.getNim(nim).then(data => {
                const isClientError = !(typeof data.res == "object")    
                console.log(isClientError)
                res.writeHead(data.status, {
                    'Content-Type' : isClientError ? 'text/plain' : 'application/json',
                    'Access-Control-Allow-Origin': '*'
                })
                res.end( !isClientError ? JSON.stringify(data.res, null, 2) : data.res)
            }).catch(err => {
                res.writeHead(500, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                })
                res.end(`Error`)
                console.log(err)
            })
        } else if(pathname == "/mahasiswa") {
            res.writeHead(200, {
                'Content-Type' : 'text/plain'
            })
            res.end(`
            Jika ingin mendapatkan seluruh data dari database mahasiswa ketik
            /mahasiswa/all?
            query : offset(optional)
                    limit(optional)
            
            Jika ingin mendapatkan satu data mahasiswa saja
            /mahasiswa/nim/:nim
            params : nim(wajib)

                    `)
        } 
        
        else {
            res.writeHead(404, {
                'Content-Type' : 'text/plain'
            })
            res.end(`NOT FOUND`)
        }
    } else if(req.method == "POST") {
        if(req.headers.authorization != process.env.PASSWORD) {
            res.writeHead(401, {
                'Content-Type' : 'text/plain'
            })
            res.end(`Not Auth`)
            return
        }
        let body = ""
        req.on('data', (buffer) => {
            body += buffer.toString()
        })
        if(pathname == "/mahasiswa2/upload") {
            req.on('end', () => {
                let parseBody = {}
                try {
                   parseBody =  JSON.parse(body)
                } catch(err) {
                    res.writeHead(400, {
                        'Content-Type' : 'application/json',
                        'Access-Control-Allow-Origin': '*'
                       })
                       console.log(err)
                    res.end(`${err}`)
                    return
                }
                    mahasiswa.addMahasiswa(parseBody).then(data => {
                    
                        const {status} = data
                    const isClientError =  typeof data.res == 'string'   
                    res.writeHead(status, {
                     'Content-Type' : isClientError ? 'text/html' : 'application/json',
                     'Access-Control-Allow-Origin': '*'
                    })
                    res.end( !isClientError ? JSON.stringify(data.res, null, 2) : data.res)
                
                }).catch(err => {
                    console.log(err)
                    res.writeHead(500, {
                        'Content-Type' : 'text/plain',
                        'Access-Control-Allow-Origin': '*'
                       })
                       res.end(`Internal Server Error`)
                })

            })
        }
    } else if(req.method == "DELETE") {
        if(req.headers.authorization != process.env.PASSWORD) {
            res.writeHead(401, {
                'Content-Type' : 'text/plain'
            })
            res.end(`Not Auth`)
            return
        }
        if(paths[0] == "mahasiswa2" && paths[1] == "hapus") {
            const nim = paths[2];
            
            if(nim == null || nim == "") {
                res.writeHead(400, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                })
                res.end(`NIM IS EMPTY`)
                return
            }
            mahasiswa.delMah(nim).then(result => {
                res.writeHead(result.status, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                    
                })
                res.end(result.res)
            }).catch(err => {
                console.log(err)
                res.writeHead(500, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                    
                })
                res.end(`Internal Server Error`)
            })
            
        } else {
            res.writeHead(404, {
                'Content-Type' : 'text/html',
                'Access-Control-Allow-Origin' : '*'

            })
            res.end(`NOT FOUND`)
        } 
    } else if(req.method == "PUT") {
        let body = ""
        req.on('data', (buffer) => {
            body += buffer.toString()
        })
        if(req.headers.authorization != process.env.PASSWORD) {
            res.writeHead(401, {
                'Content-Type' : 'text/plain',
                'Access-Control-Allow-Origin' : '*'
            })
            res.end(`Not Auth`)
            return
        }
        if(paths[0] == "mahasiswa2" && paths[1] == "edit") {
            const nim = paths[2]
            if(nim == null || typeof nim != 'string' || nim == "") {
                res.writeHead(404, {
                    'Content-Type' : 'text/plain',
                    'Access-Control-Allow-Origin' : '*'
                })
                res.end(`NIM IS NOT VALID`)
                return
            }
            req.on('end', () => {
                try {
                    parseBody =  JSON.parse(body)
                 } catch(err) {
                     res.writeHead(400, {
                         'Content-Type' : 'application/json',
                         'Access-Control-Allow-Origin': '*'
                        })
                        console.log(err)
                     res.end(`${err}`)
                     return
                 }
                mahasiswa.editMah(nim,parseBody).then(result => {
                    res.writeHead(result.status, {
                        'Content-Type' : 'text/plain',
                        'Access-Control-Allow-Origin' : '*'
                        
                    })
                    res.end(result.res)
                }).catch(err => {
                    console.log(err)
                    res.writeHead(500, {
                        'Content-Type' : 'text/plain',
                        'Access-Control-Allow-Origin' : '*'

                    })
                    res.end(`INTERNAL SERVER ERROR`)
                })
            })
        } else {
            res.writeHead(404, {
                'Content-Type' : 'text/plain',
                'Access-Control-Allow-Origin' : '*'
            })
            res.end(`NOT FOUND`)
        }
    }
    
    else {
        
        res.writeHead(400, {
            'Content-Type' : 'text/plain',
            'Access-Control-Allow-Origin' : '*'

        })
        res.end(`Cant Find that url with that method`)
    }
})


server.listen(port, (prt) => {
    console.log("Berjalan di port "+prt)
})
