"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const errorHandler = require("errorhandler");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
dotenv.config();
const usercontroller_1 = require("./controllers/usercontroller");
const file_1 = require("./schemas/file");
const chalk = require("chalk");
class Server {
    static bootstrap() {
        return new Server();
    }
    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.runners(this.connection);
    }
    config() {
        const MONGODB_CONNECTION = process.env.MONGODB_HOST + process.env.DB_NAME;
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser(process.env.SECRET_KEY));
        this.app.use(methodOverride());
        this.app.options("*", cors());
        this.app.use(cors());
        global.Promise = require("q").Promise;
        mongoose.Promise = global.Promise;
        mongoose.set('useCreateIndex', true);
        mongoose.set('useNewUrlParser', true);
        let connection = mongoose.createConnection(MONGODB_CONNECTION);
        this.connection = connection;
        var encKey = process.env.db_encryption_key;
        var sigKey = process.env.db_signing_key;
        mongoose.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['secret'] });
        this.app.locals.file = connection.model("File", file_1.UploadSchema);
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
    }
    routes() {
        let router;
        router = express.Router();
        var swaggerUi = require('swagger-ui-express'), swaggerDocument = require('../swagger.json');
        console.log(chalk.default.yellow.bgBlack.bold("Loading user controller routes"));
        new usercontroller_1.UserController().loadRoutes('/user', router);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        this.app.use('/v1', router);
        this.app.all('*', (req, res) => {
            return res.status(404).json({ status: 404, error: 'not found' });
        });
    }
    runners(connection) {
    }
}
exports.Server = Server;
