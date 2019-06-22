"use strict";
exports.__esModule = true;
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var logger = require("morgan");
var path = require("path");
var dotenv = require("dotenv");
var cors = require("cors");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var mongoose = require("mongoose"); //import mongoose
var encrypt = require("mongoose-encryption");
dotenv.config();
//routes
var usercontroller_1 = require("./controllers/usercontroller");
// import { IFolderModel } from "./models/userFolder"; 
//schemas
var file_1 = require("./schemas/file");
// import { FolderSchema } from "./schemas/folder"; 
var chalk = require("chalk");
// import { ShareController } from './controllers/filesharecontroller';
/**
 * The server.
 *
 * @class Server
 */
var Server = /** @class */ (function () {
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    function Server() {
        //create expressjs application
        this.app = express();
        //configure application
        this.config();
        //add routes
        this.routes();
        this.runners(this.connection);
    }
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    Server.bootstrap = function () {
        return new Server();
    };
    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    Server.prototype.config = function () {
        var MONGODB_CONNECTION = "mongodb://cheks:CHEKWUBE1@ds239967.mlab.com:39967/file-keeper";
        //add static paths
        this.app.use(express.static(path.join(__dirname, "public")));
        //mount logger
        this.app.use(logger("dev"));
        //mount json form parser
        this.app.use(bodyParser.json());
        //mount query string parser
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        //mount cookie parser
        this.app.use(cookieParser(process.env.SECRET_KEY));
        //mount override
        this.app.use(methodOverride());
        //cors error allow
        this.app.options("*", cors());
        this.app.use(cors());
        //use q promises
        global.Promise = require("q").Promise;
        mongoose.Promise = global.Promise;
        //connect to mongoose
        mongoose.set('useCreateIndex', true);
        mongoose.set('useNewUrlParser', true);
        var connection = mongoose.createConnection(MONGODB_CONNECTION);
        this.connection = connection;
        //mongoose encryption
        var encKey = process.env.db_encryption_key;
        var sigKey = process.env.db_signing_key;
        mongoose.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['secret'] });
        this.app.locals.file = connection.model("File", file_1.UploadSchema);
        // this.app.locals.folder = connection.model<IFolderModel>("Folder", FolderSchema);
        // catch 404 and forward to error handler
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        //error handling
        this.app.use(errorHandler());
    };
    /**
     * Create and return Router.
     *
     * @class Server
     * @method config
     * @return void
     */
    Server.prototype.routes = function () {
        var router;
        router = express.Router();
        var swaggerUi = require('swagger-ui-express'), swaggerDocument = require('../swagger.json');
        console.log(chalk["default"].yellow.bgBlack.bold("Loading user controller routes"));
        new usercontroller_1.UserController().loadRoutes('/user', router);
        // console.log(chalk.default.yellow.bgBlack.bold("Loading share controller routes"));
        // new ShareController().loadRoutes('/share',router);
        //use router middleware
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        this.app.use('/v1', router);
        this.app.all('*', function (req, res) {
            return res.status(404).json({ status: 404, error: 'not found' });
        });
    };
    Server.prototype.runners = function (connection) {
        //register and fire scheduled job runner classes
    };
    return Server;
}());
exports.Server = Server;
