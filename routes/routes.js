var tokenController = require("../controller/token-controller");
var appRouter = function(app) {
    app.get("/token", tokenController.gettoken);
    app.post("/token", tokenController.newtoken);
    
    app.get("/tokens", tokenController.gettokens);
    
    app.post("/tokenerr", tokenController.tokenerr);
}
 
module.exports = appRouter;