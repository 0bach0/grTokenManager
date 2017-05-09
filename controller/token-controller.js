var Token = require('../models/token');

exports.newtoken= (req,res,next)=>{
    console.log('Received new token ',req.body);
    var checked = (!req.body.access_token || !req.body.id) ? false : true;
    if(checked) {
        var d = new Date();
        var seconds = Math.round(d.getTime() / 1000);
        var limit = seconds + parseInt(req.body.expires);        
        var id = req.body.id;
        var expires = req.body.expires;
        var access_token = access_token;
        
        Token.findOne({'id':id}, function (err,results){
            if(err){
                console.log(err);
                return;
            }
            if(results != null){
                Token.update({'id':id},{'id':id,'name':results.name,'access_token':access_token,'status':true,'use_count':0,'expired':limit}).then((succ)=>{console.log(succ);},(succ)=>{console.log(succ);});
                res.send({status:'done',message:{info:'Updated '+id}});
            }
            else{
                console.log(req.body);
                var fburl = "https://graph.facebook.com/v2.8/me?access_token=" + req.body.access_token;
                var request = require('request');
                console.log(fburl);
                request(fburl, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        body = JSON.parse(body);
                        console.log(body.name);
                        
                        var token = new Token({'id':id,'name':body.name,'access_token':req.body.access_token,'status':true,'use_count':0,'expired':limit});
                        token.save().then((results)=>{
                            res.send({status:'done',message:{info:'Add new data '+id}});
                        }).catch((err)=>{
                            console.log(err);
                            res.send({status:'error',message:{info:'Error need to be handled.'}});                
                        });
                    }
                    else{
                        console.log(error);
                        res.send({status:'error',message:{info:'Error need to be handled.'}});                
                    }
                }
                );
            }
        });
        
        
    }
    else{
        res.send({status:'error',message:{info:'Required parameters.'}});
    }
    
    
}

exports.gettoken= (req,res,next)=>{
    Token.findOne({status:true}, function (err,results){
        if(err){
            res.send({status:'error',message:{info:'Error in db.'}});
            return;
        }
        if(results == null){
            res.send({status:'error',message:{info:'Run out of token.'}});
            return;
        }
        
        console.log('Get token',results.id);
        Token.findByIdAndUpdate(results._id, {$inc: {use_count:1}}, function (err, data) {
            if(err){
                console.log(err);
                res.send({status:'error',message:{info:'Error in update use_count.'}});
                return;
            }
            res.send({status:'done',message:{id:results.id,use_count:results.use_count,access_token:results.access_token}});
        
        });
        
    }).sort( { use_count: 'asc'});
    
}

exports.gettokens = (req,res,next)=>{
    Token.find({}, function (err,results){
        if(err){
            res.send({status:'error',message:{info:'Error in db.'}});
            return;
        }
    
        var data = [];
        for(var x in results){
            var tmp = {};
            tmp.id = results[x].id;
            tmp.name = results[x].name;
            tmp.status = results[x].status;
            tmp.expired = results[x].expired;
            tmp.use_count = results[x].use_count;
            tmp.access_token = results[x].access_token;
            
            data.push(tmp);
        }
        console.log('Get tokens ',data);
        res.send({status:'done',message:data});
    });
    
}

exports.tokenerr = (req,res,next)=>{
    console.log('Error in token ',req.body);
    var checked = (!req.body.access_token) ? false : true;
    if(checked) {
        Token.update({access_token:req.body.access_token},{status:false}).then((res)=>{console.log(res);});
        res.send({status:'done',message:{info:'Delete token.'}});
    }
    else{
        res.send({status:'error',message:{info:'Required parameters.'}});
    }
    
    
}