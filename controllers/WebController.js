/**
 * Web controller
 *
 * @file   WebController.js
 * @author airthusiast
 * @since  1.1.0
 */

const express = require("express");
const SchellenbergAPIConnector = require("../services/SchellenbergAPIConnector");

class WebController {
  /**
   * Initializes using the provided port
   *
   * @param {int} inConfig the config
   */
  constructor(config) {
    // Listen on port
    this.port = config.web.port;

    // Schellenberg API
    this.apiConnector = new SchellenbergAPIConnector(config).getInstance();

    // Start web server
    this.startWebserver();
  }

  /**
   * Starts the web server
   */
  startWebserver() {
    var app = express();

    app.set("views", __dirname + "/../views");
    app.set("view engine", "pug");

    app.get("/", (req, res) => {
      // Gather device infos
      const deviceMap = this.apiConnector.getDeviceMap();
      const baseHTMLOptions = {
        deviceMap: Object.fromEntries(deviceMap),
      };
      res.render("index", baseHTMLOptions);
    });
    app.get("/jquery/(*)", function (req, res) {
      res.sendFile(req.params[0], {
        root: __dirname + "/../node_modules/jquery/dist/",
      });
    });
    app.get("/datatables/(*)", function (req, res) {
      res.sendFile(req.params[0], {
        root: __dirname + "/../node_modules/datatables.net/",
      });
    });
    app.get("/datatables-dt/(*)", function (req, res) {
      res.sendFile(req.params[0], {
        root: __dirname + "/../node_modules/datatables.net-dt/",
      });
    });
    app.get("*", (req, res, next) => {
      res.status(200).send("Sorry, requested page not found.");
      next();
    });
    app.listen(this.port, () => {
      console.info("Server started at port " + this.port + "! #");
    });
  }
}

module.exports = WebController;
