import express from 'express';
import userRoutes from './routes/userRoutes.js';

const app = express();

//pug
app.set('view engine', 'pug');
app.set('views', './views');

//Routing
app.use('/auth', userRoutes);

const port = 3000;
//run app
app.listen(port,()=>{
    console.log("listening on http://localhost:3000");
});