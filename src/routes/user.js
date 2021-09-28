const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
//Requiero fs ya que debo leer el archivo json de usuarios y verificar si el usuario que se está registrando existe o no
const fs = require('fs');

//Requiero Multer, ya que voy a permitir que el usuario que se registre suba su avatar
const multer = require('multer');

//Requiero el paquete expres-validator
const {
    check,
    validationResult,
    body
} = require('express-validator');

//Requerir el modulo de los controladores
const controllersUser = require(path.resolve(__dirname, '..', 'controllers', 'controllersUser'));

//Aquí aperturo mi archivo de usuarios, ya que al registrarse un usuario es conveniente buscar que no exista una ya registrado con el mismo email o id o el campo que utlicen para identificar al usuario.

let archivoUsuarios =  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')))


//Aquí le incoporé lo referido a la carga de la imagen

//Aquí dispongo la información del storage para tratamiento de guardado imagenes
//https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(__dirname, '../../public/images/usuarios'));    //Aquí deben indicar donde van a guardar la imagen
    },
    filename: function (req, file, cb) {
      cb(null, 'foto' + '-' + Date.now()+ path.extname(file.originalname));      
    }
  })
   
const upload= multer({ storage })


// Métodos en nuestros controladores: index - show - edit - delete - update - logout
//Aquí disppongo mis rutas
router.get('/registro', controllersUser.registro);
//Aqui en esta ruta envio al controlador el avatar del usuario así como las respectivas validaciones

router.post('/registro', upload.single('avatar'),[
    check('first_name').isLength({
        min: 1
      }).withMessage('El campo nombre no puede estar vacío'),
    check('last_name').isLength({min: 1
      }).withMessage('El campo apellido no puede estar vacío'),
    check('email').isEmail().withMessage('Agregar un email válido'),

    //Aquí incoporé otras validaciones, para que las tengan de guía en sus proyectos

    //Aquí valido si el usuario ya está registrado en nuestro archivo JSON, esta es una forma

    body('email').custom( (value) =>{
        for (let i = 0; i < archivoUsuarios.length; i++) {
            if (archivoUsuarios[i].email == value) {
                return false    //Si esto se cumple entonces muestra el mensaje de error
            }
        }
        return true   //De no encontrase el email entonces no muestra el mensaje de errror
    }).withMessage('Usuario ya se encuentra registrado...'),

    //Aquí valido el Password   
    check('password').isLength({min: 6 }).withMessage('La contraseña debe tener un mínimo de 6 caractéres'),
    
    //Aquí valido la confimación del password dispuesto por el usuario
    check('confirm_password').isLength({min: 6 }).withMessage('La confirmación de la contraseña debe tener un mínimo de 6 caractéres'),

    //Aquí valido si las contraseñas son iguales o no
    //El ( value ) viene a ser el valor que viaje en el name del del input del campo 
    //El valor { req } corresponde a lo que viene desde el formulario

    body('confirm_password').custom((value, {req}) =>{
        if(req.body.password == value ){
            return true    // Si yo retorno un true  no se muestra el error     
        }else{
            return false   // Si retorno un false si se muestra el error
        }    
    }).withMessage('Las contraseñas deben ser iguales'),

    //Aquí obligo a que el usuario seleccione su avatar
    body('avatar').custom((value, {req}) =>{
        if(req.file != undefined){
            return true
        }
        return false;
    }).withMessage('Debe elegir su avatar y debe ser un archivo con formato: .JPG ó JPEG ó PNG')
  ], controllersUser.create);


router.get('/login', controllersUser.login);

router.post('/login',[
  check('email').isEmail().withMessage('Agregar un email válido'),
  body('email').custom( (value) =>{
    for (let i = 0; i < archivoUsuarios.length; i++) {
        if (archivoUsuarios[i].email == value) {
            
          return true    
        }
    }
    return false   
}).withMessage('Usuario no se encuentra registrado...'),
check('password').isLength({min: 6 }).withMessage('La contraseña debe tener un mínimo de 6 caractéres'),
body('password').custom((value, {req}) =>{
  for (let i = 0; i < archivoUsuarios.length; i++) {
    if (archivoUsuarios[i].email == req.body.email) {
      if(bcrypt.compareSync(value,archivoUsuarios[i].password)){
        return true
      }else{
        return false
      }
    }
}
}).withMessage('Contraseña no coinciden...')

]  ,controllersUser.ingresar);

  //Esta es la ruta que se activa al momento que el usuario desea salir de la página
  router.get('/logout', controllersUser.logout);
module.exports = router;