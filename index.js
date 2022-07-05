require('dotenv').config()
const HTTP = require('http')
const url = require("url")
const port = process.env.PORT||3000
const {mongo, pgdb} = require('./database.js')
const db = process.argv[2] == "pg" ? pgdb : mongo
const mahasiswa = require('./database2.js')



const server = HTTP.createServer((req,res) => {
const urls = url.parse(req.url, true)
const {query, pathname} = urls
const paths = pathname.slice(1).split('/')


    console.log(paths)
    if(req.method == "GET") {
        if(pathname == "/") {
            res.writeHead(200, {
                'Content-Type' : "text/plain"
            })
            res.write('Hello World😆')
            res.end()
        } else if(pathname == "/mahasiswa2/all") {
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
        } else if(paths[0] == "mahasiswa2" && paths[1] == "all") {
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
            mahasiswa.getNim(nim).then(data => {
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
            mahasiswa.getNim(nim).then(data => {
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
    } else {
        
        res.writeHead(400, {
            'Content-Type' : 'text/plain'
        })
        res.end(`Cant Find that url with that method`)
    }
})


server.listen(port, (prt) => {
    console.log("Berjalan di port "+prt)
})
