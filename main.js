/**
 * Entry point for the Smart Friends Bridge
 *
 * @file   main.js
 * @author airthusiast
 * @since  1.0.0
 */

const FileSystem = require('fs');
const Path = require("path");
const MQTTController = require('./controllers/MQTTController')
const args = process.argv.slice(2)

// Load config from provided config file
var configFile = args[0];
if(typeof configFile === 'undefined') {
    throw Error('Missing argument: Please provide JSON config filepath!');
}
try {
    var config = JSON.parse(FileSystem.readFileSync(configFile));
} catch(err) {
    throw Error('Error loading JSON config file! ' + err);
}

// Prepare Schellenberg API config
let myConfig = {
    debugConfig: {
        debugLog: config.advanced.enableDebug
    },
    sessionConfig: {
        username: config.connexion.username,
        password: config.connexion.password,
        cSymbol: config.advanced.cSymbol,
        cSymbolAddon: config.advanced.cSymbolAddon,
        shcVersion: config.advanced.shcVersion,
        shApiVersion: config.advanced.shApiVersion,
    },
    smartSocketConfig: {
        host: config.connexion.host,
        port: config.connexion.port,
        certificate: FileSystem.readFileSync(Path.resolve(__dirname, "./certs/CA.pem"))
    },
    mqtt: {
        url: config.mqtt.url,
        username: config.mqtt.username,
        password: config.mqtt.password
    }
};

// Start MQTT Controller
var mqtt = new MQTTController(myConfig);
