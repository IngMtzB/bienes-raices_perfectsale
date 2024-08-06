import express from 'express';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from "csrf-csrf";

import userRoutes from './routes/userRoutes.js';
import dbconnection from './config/db.js';

const backendPort = process.env.BACKEND_PORT || 3000;
const backendUrl = process.env.BACKEND_URL

const app = express();

//Enable reading data from forms
app.use(express.urlencoded({extended:true}));

//Habilitado cookie parser
app.use(cookieParser());
const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
    validateRequest, // Also a convenience if you plan on making your own middleware.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
  } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,
    getTokenFromRequest: req => req.body.csrfToken,
    cookieName: process.env.NODE_ENV === 'production' ? '__Host-prod.x-csrf-token' : '_csrf',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production' // Enable for HTTPS in production
    }
  });
app.use(doubleCsrfProtection);


//connection to db
try{
    await dbconnection.authenticate();
    dbconnection.sync();
    console.log('Connection has been established successfully.');
}catch(error){
    console.error('Unable to connect to the database:', error);
}


//pug
app.set('view engine', 'pug');
app.set('views', './views');

//Routing
app.use('/auth', userRoutes);

//carpeta pública
app.use(express.static('public'));


//run app
app.listen(backendPort,()=>{
    console.log(`Listening on ${backendUrl}:${backendPort}/auth/login`);
});

export {
    generateToken
}