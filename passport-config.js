const passport = require("passport")
const getEmail=require("./getData")
//Passport strategy for authenticating with a username and password.
const LocalStrategy = require('passport-local').Strategy
const bcrypt=require('bcrypt')
// var useremailid={
// 	'userpassword':"",
// 	'useremail' : ''
// };
var retrived_data;
function initialize(passport) {
	const authenticateUser = async(email,password,done) => {
		getEmail(email,(result)=>{
			retrived_data=result;
		}).then(
				async()=>{
					if(retrived_data.length == 0){
							console.log("User not found")
							return done(null,false,{message:'User not found'})
					}
					else{
						// if(retrived_data[0].useremail == null ){
						// 	return done(null,false,{message:"User not found"});
						// }
						try{
							if(await bcrypt.compare(password,retrived_data[0].userpassword)){
									
									return done(null,retrived_data[0].useremail);


							}
							else{
									return done(null,false,{message:'Wrong password/email'})

							}
						}
						catch(e){
							return done(e);
						}
					}
				}
		).
		catch((err)=>{
			return done(err)
		})
		
		
	}


	passport.use(new LocalStrategy({
		usernameField:'email'
	},authenticateUser))


	/*
	The basic idea about serialization and deserialization is, when a user is authenticated, Passport will save the user’s _id property to the session as req.session.passport.user. 
	Later on when the user object is needed, Passport will use the _id property to grab the user object from the database. 
	The reason why we don’t save the entire user object in session are: 
	1. Reduce the size of the session; 
	2. It’s much safer to not save all the user information in the session in case of misuse. */
	// passport.serializeUser((retrived_data,done)=>done(null,retrived_data[0].useremail))

	passport.serializeUser((user,done)=>{ console.log("retrived_data:",user) ;
		 return done(null,user)})
	passport.deserializeUser((user,done)=>{return done(null,user)})

}
module.exports= initialize;
