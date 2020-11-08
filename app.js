import express from 'express';
import {extname,resolve,join} from "path"
import {createReadStream,stat,statSync} from 'fs'
import {promisify} from "util"
import ejs from 'ejs';
import bodyParser from 'body-parser'
const app=new express();
app.use(express.static("public"))
app.set("view engine",'ejs')
app.get("/accueil",function(req,res){
  res.render("accueil")
})
app.get('/toto/:vid', function(req, res) {  
  res.render("index",{vid:req.params.vid})
  })
app.get("/video/:vid",function(req,res){
  //console.log(req.headers)
   
    const path=`public/${req.params.vid}`;
    const stat=statSync(path);
    const fileSize=stat.size;
    const range=req.headers.range;
    
    if(range){
        //console.log(req.headers.range)
        const parts=range.replace(/bytes=/,"").split("-");
        const start=parseInt(parts[0],10);
        const end=parts[1] ? parseInt(parts[1],10):fileSize-1;
        
    if(start >= fileSize ){res.status(416).send("Impossible");
        return ;
    }
    const chunksize=(end-start)+1;
    const file=createReadStream(path,{start,end})
    const head={
        'Content-Range':`bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
    }
    
    res.writeHead(206,head);
    file.pipe(res);
    
    }
    else{
        //console.log(req.headers)
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          }
          res.writeHead(200,head)
          createReadStream(path).pipe(res)
         // res.render("index",{video:path})
    }
})


app.listen(8080,function(){console.log("started listening on port 8080")})