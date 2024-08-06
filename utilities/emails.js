import nodemailer from "nodemailer"

const emailRegistro = async (data)=>{
    const fullUrl = `${process.env.BACKEND_URL}:${process.env.BACKEND_PORT ?? 3000}`
    const redirect_server = `${fullUrl}/auth/confirmarcorreo/`;
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      const {nombre, correo, token} = data

      //envío de email
    try{
        await transport.sendMail({
            from: 'Bienesraices-Perfectsale.com ',
            to: correo,
            subject: 'Confirma tu cuenta en Bienesraices-Perfectsale.com',
            text: 'Confirma tu cuenta en Bienesraices-Perfectsale.com',
            html: `
                    <p>Hola ${nombre}, nos alegra saber que has decidido ser arte de esta comunidad. </p>
                    <p>Para finalizar tu registro, accede al siguiente enlace: 
                        <a href="${redirect_server+token}">Confirmar cuenta</a>
                    </p>
                    <p>Si no realizaste ningún registro, ignora este correo</p>
                `
          });
          return true;
    }catch (error){
        return false;
    }    
}

export {
    emailRegistro
}