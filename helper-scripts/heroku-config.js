const result = require ( 'dotenv' ).config ()
const execSync = require ( 'child_process' ).execSync;


if (result.error) {
    throw result.error;
}

for (let key in result.parsed) {
    setConfigVar ( key, result.parsed[key] );
}

function setConfigVar (name, value) {
    try {
        const output = execSync ( 'heroku config:set ' + name + '=' + value, {encoding: 'utf-8'} );  // the default is 'buffer'
        console.log ( 'Output was:\n', output );
    } catch (e) {
        console.log ( e );
    }
}
