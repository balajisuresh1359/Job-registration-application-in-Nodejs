const express = require("express");
const path = require("path");
const app = express();
const router = express.Router();
// console.log(app);

app.use(express.static(path.join(__dirname,'files')));

app.get("/",function(req,res) {
	res.sendFile(path.join(__dirname,'files','index.html'));
});
app.listen(5000,function(err){
	console.log("Server started.....");
});


app.get("/login",function(req,res){
	res.sendFile(path.join(__dirname,'files','applyjob.html'));
});

// router.get("/login",function(req,res){
// 	res.sendFile(path.join(__dirname,'files');
// });
