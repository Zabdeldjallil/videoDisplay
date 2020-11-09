import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('TubeYou', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'  
});
import express from 'express';
import path from "path";
import {createReadStream,stat,statSync} from 'fs';
import {promisify} from "util";
import ejs from 'ejs';
import bodyParser from 'body-parser';
import multer from "multer";

const Video = sequelize.define('Video', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pathVid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pathImg:{
      type:DataTypes.STRING,
      allowNull:false
  },
},{
  });

/*(async function(){
    await Video.sync({});
    console.log("The table for the User model was just (re)created!");
  })()*/


//var upload = multer({ dest: 'public/uploads' })
const app=new express();
app.use(express.static("public"))
app.set("view engine",'ejs')

app.get("/uploading",function(req,res){
  res.render("uploading")
})
app.post('/uploading', function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  upload2(req,res,(err) =>{
    if(err)res.send("err");
    else{
      if(req.file==undefined)res.send("Undefined")
      else res.redirect("/uploading")
    }
  })
})
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

const storage2 = multer.diskStorage({
  destination: './public',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
// Init Upload
const upload2 = multer({
  storage: storage2,
  limits:{fileSize: 10000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('video');
// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /mp4|mov/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Videos Only!');
  }
}

app.listen(8080,function(){console.log("started listening on port 8080")})