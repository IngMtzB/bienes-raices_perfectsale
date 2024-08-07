import express from 'express';
import sesison from 'express-session';

import userRoutes from './routes/userRoutes.js';
import dbconnection from './config/db.js';

const backendPort = process.env.BACKEND_PORT || 3000;
const backendUrl = process.env.BACKEND_URL

const app = express();

//Enable reading data from forms
app.use(express.urlencoded({extended:true}));

//Enable session where 
app.use(sesison(
  {secret:'thisismysecretlikevictoria',
    cookie:{
      sameSite: 'strict'
    }
  }
))

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
