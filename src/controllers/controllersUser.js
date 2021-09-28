const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const {
  check,
  validationResult,
  body
} = require('express-validator');

module.exports = {
    registro: (req,res) =>{
        res.render(path.resolve(__dirname, '../views/usuarios/registro'));
    },
    create: (req, res) => {
      let errors = validationResult(req);
      if (errors.isEmpty()) {
        let user = {
          nombre: req.body.first_name,
          apellido: req.body.last_name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10),
          avatar:  req.file ? req.file.filename : '',
          role: 1    //Usuario 1 = Basico 2 = analista   9 = Administrador
        }
        let archivoUsers = fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json'), {
          encoding: 'utf-8'
        });
        let users;
        if (archivoUsers == "") {
          users = [];
        } else {
          users = JSON.parse(archivoUsers);
        };
  
        users.push(user);
        usersJSON = JSON.stringify(users, null, 2);
        fs.writeFileSync(path.resolve(__dirname, '../data/usuarios.json'), usersJSON);
        res.redirect('/login');
      } else {
        //return res.send(errors);

        //Aquí incoporé el old: req.body  --> Para poder enviar a la vista los datos que el usuario indique y no tienen errores entonces deben persistir lo que coloco el usuario

        //Si desean especificar debajo de cada input el mensaje de error específico, entonces deben enviar a la vista los errores de la siguiente manera: errors: errors.mapped()
        //Después en la vista para mostrar debajo del input el respectivo error sólo deben hacer lo siguiente:
        /*
        <div class="form-group">
            <input type="email" class="form-control" name="email" placeholder="Email" value="<%=typeof old == 'undefined' ? '':old.email %>">
            
                <% if(typeof errors != 'undefined' && errors.email){%>
            <span class="text-danger" > <%= errors.email.msg %></span>
            <%}%>
        </div>         
        */

        return res.render(path.resolve(__dirname, '../views/usuarios/registro'), {
          errors: errors.errors,  old: req.body
        });
      }
    },

    login: function(req,res){
        res.render(path.resolve(__dirname,'..','views','usuarios','login'))
    },
    ingresar: (req,res) =>{
      const errors = validationResult(req);
      //return res.send(errors.mapped());
      if(errors.isEmpty() ) {
        let archivoUsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));
        let usuarioLogueado = archivoUsers.find(usuario =>usuario.email == req.body.email)
        //Borrar de lo que llega del formulario lo que deseen
        //Por seguridad todo data critico lo pueden borrar
        delete usuarioLogueado.password;
        //Aquí voy a guardar en session al usuario
        req.session.usuario = usuarioLogueado;
        if(req.body.recordarme){
          //Crear la cookie de ese usuario
          res.cookie('email', usuarioLogueado.email,{maxAge: 1000 * 60 * 60 * 24})
        }
        res.redirect('/');
      }else{
        return res.render(path.resolve(__dirname, '../views/usuarios/login'), {
          errors: errors.mapped(),  old: req.body});       
      }

    },
    logout: (req,res) =>{
      req.session.destroy();
      res.cookie('email',null,{maxAge: -1});
      res.redirect('/')
    }

}