
const express = require('express'); // 1 .requerimos libreria de express y la guardamos en una variable.
const app = express();  //inicializamos la variable express y la guardamos en una variable que llame app

//2. seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());  // indicando que vamos a trabajar con json


//3.requerir el modulo de dotenv
const dotenv =require("dotenv")
dotenv.config({path:'./env/.env'});


//4.seteando el directorio public
app.use('/resources',express.static("public"));
app.use('/resources',express.static(__dirname + "/public"))

//6 estableciendo el motor de plantillas ejs  

app.set("view engine",'ejs');

//7 requerimos a modulo para las pasword brcryptjs 

const bcrypt =require('bcryptjs') // modulo para hacer el hashing de pasword

//8 requerimos modulo express sesion
const session = require("express-session");
app.use(session({
secret:'secret',
resave: true,
saveUninitialized: true

}));



const connection = require("./database/Basededatos"); //invocando modulo que exportamos para poder usar la conexion de la base de datos



app.get('/login',(req,res)=>{
  res.render('login')
})

app.get('/registro',(req,res)=>{
  res.render('registro')
})


// regitrar

app.post('/registro', async (req,res)=>{
  const Idjs = req.body.id;
  const passjs = req.body.password
  const Edjs = req.body.edad;
  const Emailjs = req.body.email;
  const Carjs = req.body.cargo;
  const Supjs = req.body.super;
  const NyAjs = req.body.NameApp;
  let paswordHassh = await bcrypt.hash(passjs,8)
  
  connection.query('INSERT INTO usuarios SET ?',{id_usuario:Idjs,contrasena:paswordHassh,edad:Edjs,correo_corporativo:Emailjs,cargo:Carjs,Supervisor_Encargado:Supjs,Nombres_y_Apellidos:NyAjs},async(error,results)=>{
    if(error){
      console.log(error)
    }else{
      res.render("registro",{
        alert: true,
        alertTitle:"registro",
        alertMessage: "succefull registration",
        alertIcon:"Success",
        showConfirmButton:false,
        timer: 1500,
        ruta:''

      })
    }
  })
})



app.post('/auth',async (req,res)=>{
    const idjs = req.body.user;    
    const passjs = req.body.pass;
    let paswordHassh = await bcrypt.hash(passjs,8)
    if(idjs && passjs){
       connection.query('SELECT * FROM usuarios WHERE id_usuario = ?',[idjs], async (error, results) =>{
         if(results.length == 0 || !(await bcrypt.compare(passjs,results[0].contrasena))){
          
          res.render('login',{
            alert:true,
            alertTitle: "Error",
            alertMessage:"Usuario y/o pasword incorrectos",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: "login"  
            })
          }else{
            req.session.loggedin = true;
            req.session.Nombres_y_Apellidos = results[0].Nombres_y_Apellidos
            res.render('login',{
              alert:true,
              alertTitle: "conexion exitosa",
              alertMessage:"¡LOGIN CORRECTO!",
              alertIcon: "success",
              showConfirmButton: false,
              timer: 2000,
              ruta:''  
              })
            
          }
       })
    }else{
       res.render('login',{
              alert:true,
              alertTitle: "Advertencia",
              alertMessage:"¡Por favor ingrese un usuario y/o pasword!",
              alertIcon: "warning",
              showConfirmButton: false,
              timer: false,
              ruta:''  
              })
    }
})



app.get("/",(req,res) =>{
  if(req.session.loggedin){
    res.render('index',{
      login:true,
      Nombres_y_Apellidos:req.session.Nombres_y_Apellidos
    });
  }else{
    res.render("index",{
      login: false,
      Nombres_y_Apellidos:"debe iniciar session"
    })
  }
});

// destruir session

app.get("/logout", function(req,res){
  req.session.destroy(()=>{
    res.redirect("/")
  })
})

app.listen(4000,(req,res)=>{   //configuramos el servidor en el puerto 4000  con app.listen y colocamos una funcion de flecha 
  console.log("servidor en el puerto 4000")
})