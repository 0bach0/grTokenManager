var appRouter = function(app) {
 app.get("/newtoken", function(req, res) {
    
    if(!req.query.loginname) {
        console.log("Lack of parameter");
        return res.send({"status": "error", "message": "missing parameter", "code":"300"});
    }
    var mongodb = require('mongodb');
    var MongoClient = mongodb.MongoClient;
    
    var url = 'mongodb://localhost:27017/crawl';
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //console.log('Connection established to', url);
        var collection = db.collection('TokenList');
        
        collection.find({'loginName':req.query.loginname})
            .toArray(function(err, results){
                if (err) {
                    console.log(err);
                }
                if(results.length > 0){
                    results.forEach(function (item) {
                        collection.update({'loginName':req.query.loginname},{'loginName':req.query.loginname,'accessToken':req.query.access_token,'status':'1'});
                    });
                    db.close();
                    res.send("Update token " + req.query.loginname);
                }
                else{
                    collection.insert({'loginName':req.query.loginname,'accessToken':req.query.access_token,'status':'1'}, function(err, result) {
                        if (err) {console.log(err);db.close();}
                        else{
                            db.close();
                            res.send("Created token " + req.query.loginname);
                        }
                    });
                }
            }
        );
      }
    });
 });
}
 
module.exports = appRouter;