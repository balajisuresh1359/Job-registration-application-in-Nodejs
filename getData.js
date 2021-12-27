const connection=require("./db_login_module");
const con = connection.connection;



var password = "";
const getEmail=(email,fun)=>{
	return new Promise((resolve,reject)=>{
			con.getConnection( function(err){
			if (err) {
				reject(fun(err))
			}
			else{
				 con.query("USE jobApplication", function(err){
						if (err) {
							reject(fun(err))
						}
						else{
							var sqlQuery = "select * from userData where useremail='"+email+"'";
					   		con.query(sqlQuery, function(err,result){
								if (err) {
											reject(fun(err))
										}
								else
									{
									if(result.length == 0){
										reject(fun(err));
									}
									else{
										resolve(fun(result))
									}
								}
							});
							}
						}
					)
				}
				
			}
		)	
	}
)}


// getEmail("naveen@gmail.com",(result)=>{
// 	console.log(result);
// })
module.exports= getEmail;
