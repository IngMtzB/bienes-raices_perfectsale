
const admin = async (req, res) => {
    res.render('propiedades/dashboard', {
        pagina: 'Panel de Administración',
        navLogged: true
    })
} 

export {
    admin
}