// mongo db
const mongoose = require ( 'mongoose' );

const dbname = process.env.DB_NAME
const password = process.env.DB_PASSWORD
const username = process.env.DB_USERNAME
const db_cluster_location = process.env.DB_CLUSTER_LOCATION

const uri = "mongodb+srv://"
    + username + ":"
    + password + "@"
    + db_cluster_location + "/"
    + dbname + "?retryWrites=true&w=majority";

mongoose.connect (
    uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) {
            console.log ( err );
        }
    }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>{
    console.log ("we're connected");
});

const gym_schema = new mongoose.Schema ( {
    name: String,
    guid: String,
    email_addresses: [mongoose.Schema.Types.ObjectId]
} );

const email_addresses_schema = new mongoose.Schema ( {
    email_address: String,
    gyms: [mongoose.Schema.Types.ObjectId]
} );

// NOTA BENE:
//      when creating the model, the name (passed in as the first argument to model) muse be the singular of the
//      collection name (gym for a collection name of gyms, etc). if the collection name in the database
//      is not plural, or if you would like to name the model something different a third argument can be
//      passed to model to tell mongoose the collection name, example below
//      there are several ways to explicitly tell mongoose the collection name:
//          var schema = new Schema({ name: String }, { collection: 'actor' });
//              or
//          schema.set('collection', 'actor');
//              or
//          var collectionName = 'actor'
//          var M = mongoose.model('Actor', schema, collectionName)

const gym_model = mongoose.model ( "gym", gym_schema);
const email_address_model = mongoose.model ( "email_address_item", email_addresses_schema, "email_addresses");

exports.gym_model = gym_model;
exports.email_address_model = email_address_model;
