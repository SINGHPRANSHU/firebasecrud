const functions = require('firebase-functions');
const app = require('express')();
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');
const Multer = require('multer');
const os = require('os');
var  path = require('path');
var  fs = require('fs');
const gcconfig={projectId:"democrud-ab3d6",keyFilename:"./democrud-ab3d6-firebase-adminsdk-m3597-fab3fe0390.json"};
const {Storage} =  require('@google-cloud/storage');
const gcs =new Storage(gcconfig);
const Busboy =require('busboy');



const { log } = require('firebase-functions/lib/logger');


const firebaseApp = firebase.initializeApp(functions.config().firebase);

const db = firebase.firestore();






app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.post('/create',(req,res)=>{
    const {name,email}=req.body;
    db.collection('user').doc(email).create({name,email}).then((data)=>{
        res.sendStatus(200);
        
    }).catch((err)=>{console.log(err);
        res.sendStatus(404);
    })
});

app.get('/read/:email',(req,res)=>{
    const email=req.params.email;
    
    db.collection('user').doc(email).get().then((data)=>{
   
       res.json(data).sendStatus(200);
    }).catch(err=>{
        res.sendStatus(404);
    }) 
});

app.put('/update',(req,res)=>{
    const {email,name}=req.body;
    db.collection('user').doc(email).update({name}).then(data=>{
        res.sendStatus(200).send(data);
        
    }).catch(err=>{
        res.send(err).sendStatus(404);
    })
});

app.delete('/delete',(req,res)=>{
    const {email}=req.body;
    db.collection('user').doc(email).delete().then(data=>{
        res.sendStatus(200);
    }).catch(err=>{
        res.sendStatus(404);
    })
});


app.post('/upload',(req,res)=>{
         const busboy= new Busboy({
             headers:req.headers
         });
         let uploadData =null;
         busboy.on('file',(fieldname,file,filename,encoding,mimetype)=>{
             const filepath = path.join(os.tmpdir(),filename);
             uploadData = {file:filepath,type:mimetype};
             file.pipe(fs.createWriteStream(filepath));
         });
         busboy.on('finish',()=>{
            const bucket = gcs.bucket('democrud-ab3d6.appspot.com/');
            bucket.upload(uploadData.file,{
                uploadType:'media',
                metaData:{
                    contentType:uploadData.type
                }
            }).then((uploadedfile)=>{
               
                res.sendStatus(200).json({msg:"uploaded"});
            }).catch(err=>{res.sendStatus(500)});
         });
         busboy.end(req.rawBody);

    
   
    });
    









exports.app = functions.https.onRequest(app);
