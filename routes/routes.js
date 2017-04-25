var appRouter = function(app) {
 app.get("/newtoken", function(req, res) {
    console.log('New token',req.query);
    
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    
    var url = 'mongodb://localhost:27017/crawl';
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //console.log('Connection established to', url);
        var collection = db.collection('TokenList');
        
        var d = new Date();
        var seconds = Math.round(d.getTime() / 1000);
        var limit = seconds + parseInt(req.query.expires);
        console.log('Find ',req.query.id);
        collection.find({'id':req.query.id})
            .toArray(function(err, results){
                console.log("Search to get new in db",results);
                if (err) {
                    console.log(err);
                }
                if(results.length > 0){
                    results.forEach(function (item) {
                        collection.update({'id':req.query.id},{'id':req.query.id,'name':item.name,'access_token':req.query.access_token,'status':'1','used':0,'expired':limit});
                    });
                    db.close();
                    res.send("Update token " + req.query.id);
                }
                else{
                    var fburl = "https://graph.facebook.com/v2.8/me?access_token=" + req.query.access_token;
                    var request = require('request');
                    console.log(fburl);
                    request(fburl, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            
                            console.log(body);
                            body = JSON.parse(body);
                            collection.insert({'id':body.id,'name':body.name,'access_token':req.query.access_token,'status':'1','used':0,'expired':limit}, function(err, result) {
                                if (err) {console.log(err);db.close();}
                                else{
                                    db.close();
                                    res.send("Created token " + req.query.id);
                                }
                            });        
                        }
                        else{
                            console.log(error,body);
                            res.send('failed');
                        }
                    });
                    
                    
                }
            }
        );
      }
    });
 });
 app.get("/gettoken",function(req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    
    var url = 'mongodb://localhost:27017/crawl';
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      }
      else {
        var collection = db.collection('TokenList');
        // collection.find({}).toArray(function(err, results){
        collection.find({'status':'1'},{'sort':'used'}).toArray(function(err, results){
            
            if (err) {
                    console.log(err);
                    db.close();
                }
            if(results.length > 0){
                    console.log(results[0]);
                    collection.update({'id':results[0].id},{'id':results[0].id,'name':results[0].name,'token':results[0].token,'status':'1','used':parseInt(results[0].used)+1});
                    res.send({'message':'ok','access_token':results[0].access_token});
                    db.close();
            }
            else{
                console.log("No useful left");
                res.status(404).send({'message':'No useful left'});
                db.close();
            }
        });
      }
      
    });
 })
 app.get("/tokenerror",function(req, res) {
    if(!req.query.access_token) {
        console.log("Lack of parameter");
        return res.send({"status": "error", "message": "missing parameter", "code":"300"});
    }
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    
    var access_token = req.query.access_token;
    var url = 'mongodb://localhost:27017/crawl';
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      }
      else {
        var collection = db.collection('TokenList');
        collection.find({'access_token':access_token}).toArray(function(err, results){
            console.log('Remove token',access_token);
            if (err) {
                    console.log(err);
                    db.close();
                }
            if(results.length > 0){
                    console.log(results[0]);
                    collection.update({'id':results[0].id},{'id':results[0].id,'name':results[0].name,'access_token':results[0].access_token,'status':'0','used':parseInt(results[0].used)});
                    res.send({'message':'Removed','code':'200'});
                    db.close();
            }
            else{
                console.log("No useful left");
                res.send({'message':'No useful left','code':'404'});
                db.close();
            }
        });
      }
    });
 })
 
app.get("/getlisttoken",function(req, res) {
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    
    var url = 'mongodb://localhost:27017/crawl';
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      }
      else {
        var collection = db.collection('TokenList');
        collection.find({}).toArray(function(err, results){
            console.log(results);
            if (err) {
                    console.log(err);
                    db.close();
                }
            var respond = "";
        
            results.forEach(function(listItem, index){
                respond = respond + '{"id":'+ JSON.stringify(listItem.id) + ","+ '"name":"'+ JSON.stringify(listItem.name) +","+ '"used":"'+ JSON.stringify(listItem.used) + '",'+ '"status":'+ JSON.stringify(listItem.status)+ '",'+ '"expired":'+ JSON.stringify(listItem.expired) + ','+ '"access_token":'+ JSON.stringify(listItem.access_token) +'}';
                if (index < results.length-1)
                    respond = respond + '|';
            });
            // respond = respond + ']';
            console.log(respond);
            
            res.send(respond);
            db.close();
        });
                
                    
                
      }
      
    });
 })
}
 
module.exports = appRouter;