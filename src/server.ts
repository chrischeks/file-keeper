import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as dotenv from "dotenv";
import * as cors from "cors";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import mongoose = require("mongoose"); //import mongoose
import encrypt = require('mongoose-encryption');
import { uploader, cloudinaryConfig } from './config/cloudinaryConfig'
dotenv.config();

//routes
import { UserController } from "./controllers/usercontroller";


//interfaces
import { IUserUpload } from "./interfaces/userUpload";
// import { IUserFolder } from "./interfaces/userFolder";

//models
import { IUploadModel } from "./models/userUpload"; //import IUserModel
// import { IFolderModel } from "./models/userFolder"; 


//schemas
import { UploadSchema } from "./schemas/file"; 
// import { FolderSchema } from "./schemas/folder"; 


import chalk = require('chalk');
import { info } from "console";
// import { ShareController } from './controllers/filesharecontroller';

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;
  private connection: mongoose.Connection;
  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {

    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    this.routes();

    this.runners(this.connection);
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  
  public config() {
    const MONGODB_CONNECTION: string = "mongodb://cheks:CHEKWUBE1@ds239967.mlab.com:39967/file-keeper";
    
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
    mongoose.set('useNewUrlParser', true)
    let connection: mongoose.Connection = mongoose.createConnection(MONGODB_CONNECTION);
    this.connection = connection;

    //mongoose encryption
    var encKey = process.env.db_encryption_key;
    var sigKey = process.env.db_signing_key;
    mongoose.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['secret'] });
   
    this.app.locals.file = connection.model<IUploadModel>("File", UploadSchema);
    // this.app.locals.folder = connection.model<IFolderModel>("Folder", FolderSchema);

    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
  }

  /**
   * Create and return Router.
   *
   * @class Server
   * @method config
   * @return void
   */
  private routes() {
    let router: express.Router;
    router = express.Router();

    var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../swagger.json');

    console.log(chalk.default.yellow.bgBlack.bold("Loading user controller routes"));
    new UserController().loadRoutes('/user',router);

    // console.log(chalk.default.yellow.bgBlack.bold("Loading share controller routes"));
    // new ShareController().loadRoutes('/share',router);

    this.app.use('*', cloudinaryConfig);
    //use router middleware
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    this.app.use('/v1',router);

    this.app.all('*', (req, res)=> {
      return res.status(404).json({ status: 404, error: 'not found' });
    });
  }
  

  private runners(connection: mongoose.Connection): any {
    //register and fire scheduled job runner classes
  }
}