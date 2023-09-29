const isLogin = async(req,res,next)=>{

    try {
        
        if(req.session.user_id && req.session.is_admin == 0){}
        else{
            res.redirect('/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }

}

const isLogout = async(req,res,next)=>{

    try {
        
        if(req.session.user_id && req.session.is_admin == 0){
            res.redirect('/');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    isLogin,
    isLogout
}