var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Token', new Schema({ 
    	id: String, 
    	name: String,
    	access_token: String,
    	status: Boolean,
    	use_count:Number,
    	expired: String
}));