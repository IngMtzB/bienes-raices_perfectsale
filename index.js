import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';

import dbconnection from './config/db.js';

const backendPort = process.env.BACKEND_PORT || 3000;
const backendUrl = process.env.BACKEND_URL

const app = express();

//Enable reading data from forms
app.use(express.urlencoded({extended:true}));

//Habilitar session
app.use(cookieParser());
//Habilitar CSRF
app.use(csurf({cookie: true}));

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
app.use('/', propiedadesRoutes);

//carpeta pública
app.use(express.static('public'));


//run app
app.listen(backendPort,()=>{
    console.log(`Listening on ${backendUrl}:${backendPort}/auth/login`);
});
