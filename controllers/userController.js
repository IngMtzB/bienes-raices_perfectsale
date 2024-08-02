const formularioLogin = (req,res)=>{
    res.render('auth/login',{
        pagina: 'Iniciar sesión',
        autenticado : false
    })
}

const formularioRegistro = (req,res)=>{
    res.render('auth/registro',{
        pagina: 'Crear cuenta',
    })
}


export {
    formularioLogin,
    formularioRegistro
};