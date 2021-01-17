/**
 * MQTT Controller
 *
 * @file   MQTTController.js
 * @author airthusiast
 * @since  1.0.0
 */

const mqtt = require("mqtt");
const SchellenbergAPIConnector = require("../services/SchellenbergAPIConnector");
const LogService = require('schellenbergapi/Service/LogService');

class MQTTController {
  /**
   * The MQTT controller, handles MQTT messages between external clients and Schellenberg API.
   *
   * @param {int} inConfig the config
   */
  constructor(config) {
    // LogService
    this.logService = new LogService(config.debugConfig);

    // Schellenberg API
    this.apiConnector = new SchellenbergAPIConnector(config).getInstance();

    // Create MQTT client
    this.connect(config.mqtt.url, config.mqtt.username, config.mqtt.password);

    // Setup listeners
    this.setupListeners();
  }

  /**
   * Connect to the MQTT Broker
   *
   * @param {string} url URL of the MQTT broker
   * @param {string} username username for MQTT authentication
   * @param {string} password password for MQTT authentication
   */
  connect(url, username, password) {
    this.client = mqtt.connect(url, {
      username: username,
      password: password,
    });
  }

  /**
   * Setup listeners to:
   *  - the MQTT broker events
   *  - Schellenberg API events
   *
   */
  setupListeners() {
    // Subscribe to all schellenberg topics
    this.client.on("connect", () => {
      this.client.subscribe("schellenberg/device/value/#");
    });

    // IN: MQTT Broker ==> Controller ==> SmartFriends
    // Topic example: schellenberg/device/value/update/xxxxx
    this.client.on("message", (topic, message) => {
      this.logService.debug("New message on topic " + topic  + ": " + message, "MQTTController");
      var topic_levels = topic.split("/");
      if (
        topic.startsWith("schellenberg/device/value/update/") &&
        !isNaN(topic_levels[4])
      ) {
        this.logService.debug("Handler found for topic " + topic, "MQTTController");
        return this.processDeviceUpdate(topic_levels[4], message);
      } else {
        this.logService.debug("No handler found for topic " + topic, "MQTTController");
      }
    });

    // OUT: SmartFriends ==> Controller ==> MQTT Broker
    // Topic example: schellenberg/device/value/xxxxx
    this.apiConnector.api.on("newDV", (data) =>
      this.publishDeviceStatus(data.deviceID, data.value)
    );

    this.apiConnector.api.on("newDI", (data) => {
      console.info("Device found:");
      console.info(" > deviceID:          " + data.deviceID);
      console.info(" > masterDeviceID  :  " + data.masterDeviceID);
      console.info(" > masterDeviceName:  " + data.masterDeviceName);
      console.info(" > deviceName:        " + data.deviceName);
      console.info(" > deviceDesignation: " + data.deviceDesignation);
    });
  }

  /**
   * Updates the Smart Friends Device based on the given information
   *
   * @param {number} deviceID the device's ID to operate
   * @param {string} value the new device value to set
   */
  processDeviceUpdate(deviceID, newValue) {
    newValue = newValue.toString();
    return this.apiConnector.setDeviceValue(deviceID, newValue);
  }

  /**
   * Publishes latest Smart Friends Device status to MQTT
   *
   * @param {number} deviceID the device's ID to operate
   * @param {string} value the new device value to publish
   */
  publishDeviceStatus(deviceID, value) {
    if (deviceID !== "" && value !== "") {
      var topic = "schellenberg/device/value/" + deviceID;
      var message;
      console.log(topic + " => " + value);
      if (value.toString().substr(0, 1) == "[") {
        // Handle as JSON
        message = JSON.stringify(value);
      } else {
        message = value.toString();
      }

      console.log(topic + " => " + message);

      var options = { retain: true, qos: 0 };
      this.client.publish(topic, message, options);
    }
  }
}

module.exports = MQTTController;
