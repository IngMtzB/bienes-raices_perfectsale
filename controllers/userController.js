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

const formularioRecuperarPassword = (req,res)=>{
    res.render('auth/recuperarCuenta',{
        pagina: 'Recuperar cuenta',
    })
}


export {
    formularioLogin,
    formularioRegistro,
    formularioRecuperarPassword
};