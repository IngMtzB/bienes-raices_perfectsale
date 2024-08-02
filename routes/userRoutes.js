import express from 'express';

const router = express.Router();

router.route('/')
    .get((req,res)=>{
        res.json({message:"Get method"});
    })
    .post((req,res)=>{
        res.json({message:"Post method"});
    });

router.get('/login',(req,res)=>{
    res.render('auth/login.pug',{
        autenticado : false
    })
});

export default router;