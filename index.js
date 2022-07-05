require('dotenv').config()
const HTTP = require('http')
const url = require("url")
const pretty = require('pretty-js')
const port = process.env.PORT||3000
const {mongo, pgdb} = require('./database.js')
const db = process.argv[2] == "pg" ? pgdb : mongo

const server = HTTP.createServer((req,res) => {
    const {query, pathname} = url.parse(req.url, true)
    if(pathname == "/") {
        res.writeHead(200, {
            'Content-Type' : "application/json"
        })
        res.write('Hello World😆')
        res.end()
    } else if(pathname == "/mahasiswa/all") {
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
    } else if(pathname == "/mahasiswa/nim") {
        const {nim} = query
        if(nim == null) {
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
    }
})


server.listen(port, (prt) => {
    console.log("Berjalan di port "+prt)
})
