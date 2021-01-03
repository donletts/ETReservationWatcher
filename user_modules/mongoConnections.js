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
db.on ( 'error', console.error.bind ( console, 'connection error:' ) );
db.once ( 'open', () => {
    console.log ( "we're connected" );
} );

const gym_schema = new mongoose.Schema ( {
    region: String,
    brand: String,
    name: String,
    guid: String,
    email_addresses: [{type: mongoose.Schema.Types.ObjectId, ref: 'email_address_item'}]
} );

const email_addresses_schema = new mongoose.Schema ( {
    email_address: String,
    gyms: [{type: mongoose.Schema.Types.ObjectId, ref: 'gym'}]
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

const gym_model = mongoose.model ( "gym", gym_schema );
const email_address_model = mongoose.model ( "email_address_item", email_addresses_schema, "email_addresses" );

exports.get_all_gyms = async function () {
    const all_gyms = await gym_model.aggregate (
        [
            // stage 1
            {
                $group: {
                    _id: {
                        region: "$region",
                        brand: "$brand"
                    },
                    names: {
                        $addToSet: {
                            name: "$name"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.region",
                    brands: {
                        $addToSet: {
                            brand: "$_id.brand",
                            names: "$names"
                        }
                    }
                }
            },
            {
                $project:{
                    _id: 0,
                    region: "$_id",
                    brands: 1
                }
            },
            {$sort: {region: 1}}
        ] ).exec ();

    return all_gyms;
}

exports.get_emails_for_gym_name = async function (gym_name) {
    // const gyms = await gym_model.find ().lean ().exec ();
    // console.log ( gyms );
    const gym_query = await gym_model.findOne ( {name: {$eq: gym_name}} ).populate ( 'email_addresses' ).exec ();
    const email_addresses = gym_query.email_addresses;
    let ea = [];
    for (let i = 0; i < email_addresses.length; i++) {
        ea[i] = email_addresses[i].email_address;
    }
    return ea;
}

exports.gym_model = gym_model;
exports.email_address_model = email_address_model;
