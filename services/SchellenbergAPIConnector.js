/**
 * Schellenberg API Connector
 *
 * This singleton class manages calls to the Schellenberg API.
 *
 * @file   SchellenbergAPIConnector.js
 * @author airthusiast
 * @since  1.0.0
 */

const SchellenbergApi = require('schellenbergapi');

class SchellenbergAPIConnector {

    constructor(config) {

        this.api = new SchellenbergApi(config, console.log);
    }

    /**
     * Calls Schellenberg API and retieves the device's value.
     *
     * @param {number} deviceID the device's ID to operate
     * @returns {string} device's value
     */
    getDeviceValue(deviceID) {
        // Send command
        return this.api.handler.getDeviceValue(deviceID);
    }

    /**
     * Calls Schellenberg API and send a new command to update device's value.
     *
     * @param {number} deviceID the device's ID to operate
     * @param {string} value the new device's value
     * @returns {boolean} true if success, false otherwise
     */
    setDeviceValue(deviceID, value) {
        // Send command
        return this.api.handler.setDeviceValue(deviceID, value);
    }

   /**
     * Calls Schellenberg API and retieves the device info map.
     *
     * @returns {map} device info map
     */
    getDeviceMap() {
        return this.api.dataStore.deviceMap;
    }
}

class SchellenbergAPIConnectorSingleton {

    constructor(config) {
        if (!SchellenbergAPIConnectorSingleton.instance) {
            SchellenbergAPIConnectorSingleton.instance = new SchellenbergAPIConnector(config);
        }
    }

    getInstance() {
        return SchellenbergAPIConnectorSingleton.instance;
    }
}

module.exports = SchellenbergAPIConnectorSingleton;
