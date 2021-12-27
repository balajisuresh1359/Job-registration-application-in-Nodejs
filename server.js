if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config()
}
const express = require("express")
const app = express()
const alert = require('alert');
const fs = require("fs");
const formidable = require('formidable');
const path=require("path")
const multer = require('multer')
const busboy = require("then-busboy")
const bodyParser=require("body-parser");
const fileUpload = require('express-fileupload')
const bcrypt = require("bcrypt")
const passport = require("passport")
const flash =require("express-flash")
const session =require("express-session")
const methodoverride = require("method-override")
const connection=require("./db_login_module");
const con = connection.connection;
const ejs = require("ejs")
app.use(methodoverride('_method'))

var useremailid={
	'userpassword':"",
	'useremail' : ''
};

app.use(express.urlencoded({extended : false}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, './uploads')));



app.set('views',path.join(__dirname, './views'));
app.set('view-engine','ejs')


const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

var storage =   multer.diskStorage({
	destination: function (req, file, callback) {
	  callback(null, './uploads/Resumes');
	},
	filename: function (req, file, callback) {
	  callback(null, file.fieldname + '-' + Date.now());
	}
  });
var upload = multer({ storage : storage}).single('resume');
  
  


app.use(flash())
app.use(session({
	secret:process.env.SESSION_SECRET,
	resave:false,
	saveUninitialized:false
}))




const initializePassport=require("./passport-config")
initializePassport(passport)


app.use(passport.initialize())
app.use(passport.session())


app.get("/",checkAuthenticate,olduser,(req,res)=>{
	res.render('index.ejs',{username:'Hello '+useremailid.useremail,email:useremailid.useremail})
})

app.get('/application-status',(req,res)=>{
	res.render("application-status.ejs",{message:"Hey! "+useremailid.useremail+".. your application saved successfully."})

})
function olduser(req,res,next) {
	con.getConnection(function(err){
		if(err){

			return res.send(err)
		}
		else{
			con.query("USE jobApplication",function(err){
				if (err) {
					return res.send(err)
				}
				else{
					con.query("select email from application  where email = '"+useremailid.useremail+"'",function(err,result){
						if (err) {
							return res.send(err)
						}
						else{
							console.log(result);
							if(result.length!=0){
								console.log("if");
								return 	res.redirect("/application-status")

								
							}
							else{
								console.log("else");
								return next()
							}
						}
					})
				}
			})
		}
	})

}
app.get("/login",checknotAuthenticate,(req,res)=>{
	res.render('login.ejs')
})

app.get("/register",checknotAuthenticate,(req,res)=>{
	res.render("register.ejs")
})

function assignvalue(req,res,next) {
	useremailid.useremail=req.body.email;
	useremailid.userpassword=req.body.password;
	next();
	return
}
app.post('/login',assignvalue,checknotAuthenticate,passport.authenticate('local',{
	successRedirect:'/',
	failureRedirect:'/login',
	failureFlash:true
}))

app.post('/add-application',assignvalue,(req,res)=>{
	 var post  = req.body;
     var name= post.name;
     var pay=post.desired_pay;
     var phone= post.phone;
     var address=post.address;
     var email=post.email;
     var age = post.age;
     var college=post.college_name;
     var cgpa=post.cgpa;
     var passout = post.passout_year;
     var degree = post.degree;
     var branch = post.branch;
     var tamil = post.tamil?1:0;
     var english = post.english?1:0;
     var extra_act=post.extra_act;
     var c=post.c? 1 : 0;
     var java=post.java? 1 : 0;
     var python=post.python? 1 : 0;
     var cplus = post.cplus? 1 : 0;
     var csharp=post.csharp? 1 : 0;
     var go=post.go? 1 : 0;
     var js =post.js? 1 : 0;
     var project=post.favourite_project;
     var achievement=post.achievement;
     var indian_status = post.workIndia;
     console.log(indian_status)
     var position =post.desired_position;
	//  console.log(req.files.resume)
     var img_name = "post.uploaded_images";
	 var sql = "INSERT INTO `application`(`name`,`email`,`phone`,`address`, `age` ,`profile_image`,`position`,`desired_pay`,`college`,`cgpa`,`passout_year`,`degree`,`branch`,`tamil`,`english`,`extra_act`,`c`,`java`,`python`,`cplusplus`,`csharp`,`go`,`js`,`project`,`achievement`,`indian_citizen`) VALUES ('" + name + "','" + email + "','" + phone + "','" +address+"'," +parseInt(age) + ",'" + img_name + "','" + position + "','" + pay+ "','" + college+"'," + parseInt(cgpa)+"," + parseInt(passout)+",'" + degree+"','" + branch+"'," + parseInt(tamil)+"," + parseInt(english)+",'" + extra_act+"'," + parseInt(c)+"," + parseInt(java)+"," + parseInt(python)+"," + parseInt(cplus)+"," + parseInt(csharp)+"," + parseInt(go)+"," + parseInt(js)+",'" + project+"','" + achievement+"','"+indian_status+"')";
	 try{
		con.query("USE jobApplication",function(err){
							if(err){
								console.log(err);
								res.render('index.ejs',{username:"Something went wrong...try again"})
							}
							else{
								var query = con.query(sql, function(err, result) {
									if(err){
										console.log(err);
										res.render('index.ejs',{username:"please fill in all mandatory fields."})
									}
									else{
										upload(req,res,function(err) {
											if(err) {
												return res.end("Error uploading file.");
											}
											res.render("application-status.ejs",{message:"Hey! "+useremailid.useremail+".. your application saved successfully."})
										});
										// res.render("application-status.ejs",{message:"Hey! "+useremailid.useremail+".. your application saved successfully."})
									}
								});
							}
					})
	 }
	 catch(err){
		res.render('index.ejs',{username:"Something went wrong...try again"})
	 }
})

app.post('/register',checknotAuthenticate,async (req,res)=>{
	try{
	if (req.body.password == req.body.Confirm_password) 
	{
		var salt =bcrypt.genSaltSync(10);
		const hashedPassword = await bcrypt.hash(req.body.password,salt)
		con.getConnection(function (err) {
			if (err) {
				console.log(err.stack);
				res.render('register.ejs',{message :"Oops...Something went wrong... try again"})
			} else {
				con.query("USE jobApplication",function (err) {
					if (err) {
						console.log(err.stack);
						res.render('register.ejs',{message :"Oops...Something went wrong... try again"})
					}
					else{
						if(req.body.email.length ==0 ){
								res.render('register.ejs',{message :"Please enter valid email id"})

						}
						var sqlQuery = "insert into userData(username,useremail,userpassword) values('"+req.body.name+"','"+req.body.email+"','"+hashedPassword+"')";
						con.query(sqlQuery,function(err,result){
							if (err) {
								console.log("Error 1:",err.stack);
								return res.render('register.ejs',{message :"This email already exits."})

							}
							console.log("Inserted...");
							console.log(result);
							res.redirect('/login');
						});
					}
				});
			}
		});
	}
	else{
		alert('password mismatch');
	}}
	catch{
		con.end();
		res.redirect("/register")
	}
})

app.post('/delete_application',(req,res)=>{
	con.getConnection(err=>{
		if(err){
			console.log(err);
			return res.render('application-status.ejs',{err_message:"Oops Something went wrong.."})
		}
		else{
			con.query("delete from application where email = '"+useremailid.useremail+"'",(err,result)=>{
				if (err) {
					console.log(err);
					return res.render('application-status.ejs',{err_message:"Oops Something went wrong.."})
				}
				else{
					return  alert("Changes saved....");
				}
			})
		}
	})
})

app.post('/viewform',(req,res)=>{
	con.getConnection(function (err) {
		if(err){
			console.log(err);
			res.render('application-status.ejs',{err_message:"Oops Something went wrong.."})
		}
		else{
			con.query("USE jobApplication",function (err) {
				if(err){
					console.log(err);
						res.render('application-status.ejs',{err_message:"Oops Something went wrong.."})
				}
				else{
					var query = "select * from application where email = '"+useremailid.useremail+"'";
					con.query(query,function (err,result) {
						if(err){
							console.log(err);
								res.render('application-status.ejs',{err_message:"Oops Something went wrong.."})
						}
						else{


							if (result.length == 0) {
								alert("No data here....")
								return
							}

							var pro_lan="";
							if(result[0].c == 1){
								pro_lan+="C ,";
							}
								if(result[0].java == 1){
								pro_lan+="JAVA ,";
							}	if(result[0].python == 1){
								pro_lan+="Python ,";
							}	if(result[0].cplusplus == 1){
								pro_lan+="C++ ,";
							}	if(result[0].csharp == 1){
								pro_lan+="C# ,";
							}	if(result[0].go == 1){
								pro_lan+="GO ,";
							}	if(result[0].js == 1){
								pro_lan+="JS ,";
							}
							pro_lan=pro_lan.slice(0,-1);
							var lan=""
								if(result[0].tamil == 1){
								lan+="Tamil ,";
							}	if(result[0].english == 1){
								lan+="English ,";
							}
							lan=lan.slice(0,-1);
							console.log(result);
							

							res.render('viewapplication.ejs',{

								name:result[0].name,
								email:result[0].email,
								age:result[0].age,
								indCit:result[0].indian_citizen,
								number:result[0].phone,
								position:result[0].position,
								pay:result[0].desired_pay,
								college:result[0].college,
								cgpa:result[0].cgpa,
								passoutyear:result[0].passout_year,
								degree:result[0].degree,
								branch:result[0].branch,
								lan:lan,
								extAct:result[0].extra_act,
								pro_lan:pro_lan,
								project:result[0].project,
								achievement:result[0].achievement
							})
					
						}
				}		)
			}
		})
	}
	})
})




app.post("/save",(req,res)=>{
	console.log("Req:",req);
	var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.filepath;

	  var img_path="./uploads/Profile_images"+useremailid.useremail+Date.now()+".jpeg";
      const newpath = path.join(__dirname, img_path);
      fs.rename(oldpath, newpath, function (err) {
      if (err) res.status(500).send(err);
        res.write('File uploaded and moved!');
        res.end();
      });
})
})


app.delete('/logout',(req,res)=>{
	req.logOut();
	res.redirect('/login')
})
function checkAuthenticate(req,res,next) {
	if(req.isAuthenticated()){
		return next()
	}
	else{
		res.redirect("/login")
	}
}

function checknotAuthenticate(req,res,next) {
	if(req.isAuthenticated()){
		return res.redirect('/')
	}
	else{
		next()
	}
}





app.listen(5000);

// npm run devStart
