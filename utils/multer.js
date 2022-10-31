const multer = require('multer');
const path = require('path');

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if(ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".gif"){
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    }
});



// const express = require('express');
// const router = express.Router();
// const multer = require('multer');



// const storage = multer.diskStorage({
//     destination: (req, file, cb)=>{
//         cb(null, './uploads')
//     },
//     filename: (req, file, cb)=>{
//         cb(null, Date.now()+".jpg")//// filename is timestamp.jpg
//     }
// });


// const upload = multer({
//     storage: storage
// });
// router.route("/addImage").post(upload.single("img"),(req, res)=>{
//     try{
//         res.json({path: req.file.filename});
//         res.status(200).send({status:"ok", msg: "The request was made successfully"});
//     }catch(e){
//         return res.status(400).send({status:"error", msg:"Some error occured"});
//     }
// });

// module.exports = router;
