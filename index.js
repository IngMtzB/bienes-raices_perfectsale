import express from 'express';
import userRoutes from './routes/userRoutes.js';
import dbconnection from './config/db.js';

const app = express();

//Enable reading data from forms
app.use(express.urlencoded({extended:true}));

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

const port = 3000;
//run app
app.listen(port,()=>{
    console.log("listening on http://localhost:3000");
});