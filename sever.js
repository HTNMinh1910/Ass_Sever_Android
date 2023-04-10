const express = require("express");
const app = express();
const fs = require('fs');
const http = require('http');
const hbs = require("express-handlebars");
const path = require("path");
const multer = require('multer');
const body = require('body-parser')
const { json } = require('express')
var passport = require('passport')
const method_override = require("method-override")

const usersMod = require('./models/UsersModel')
const productsMod = require('./models/ProductModel')
const database = require('./configs/database')

const port = 8080
database.connect()
app.use(method_override("_method"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.engine('.hbs', hbs.engine({ 
  extname: "hbs", 
  defaultLayout: 'main', 
  layoutsDir: "./src/views/layouts/",
  helpers: {
      sum: (a, b) => a + b
    }}));
app.set('view engine', 'hbs');
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));
app.set('views', path.join(__dirname, '/src/views'));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      dir = ('./public')
      fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
  },
  filename: function (req, file, cb) {
      let filename = file.originalname
      let arr = filename.split('.')
      let newFilename = arr[0] + '-' + Date.now() + '.' + arr[1]
      cb(null, newFilename)
  }
})
var upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
      let arrFileName = file.originalname.split('.')
      if (!arrFileName[1].match('jpg|jpeg|png')) {
          return cb(new Error('Chỉ được tải ảnh định dạng JPEG,PNG'))
      }
      cb(null, true)
  }
}).array('imgRes', 2)
app.post('/changeImg', (req, res) => {
  res.render('upImg')
})




app.get('/', (req, res) => {
  res.render('signIn')
})
app.get('/createAcc', (req, res) => {
  res.render('signUp')
})

app.get('/profile', (req, res) => {
  res.render('profile', {showHeader: true})
})
app.get('/signIn', function(req, res){
    let email = req.query.email;
    let pass = req.query.password;
    let check = false
    usersMod.find({}).then(data_use => {
      data_use = data_use.map(data=>data.toObject());
      console.log(data_use);
        for (let i = 0; i < data_use.length; i++) {
            if (email == data_use[i].email && pass == data_use[i].pass) {
             check = true 
            }
          }
          if (check) {
            res.render('listUsers', { layout: 'main', data: data_use, showHeader: true})
        } else {
            res.render('signIn', { layout: 'main', wrong: true})
        }
    })
})

app.post('/signUp', (req, res, next) => {
  let newUser = new usersMod(req.body)
  console.log(newUser)
  newUser.save().then(()=>{
    res.redirect('/signIn')
  }).catch(next)  
})
//   let userNum = req.query.userNum
//   fs.readFile('list_user.json', function (err, data) {
//       let obj = JSON.parse(data)
//       let dataUse = fs.readFileSync('list_user.json')
//       let myData = JSON.parse(dataUse)
//       let i = 0
//       while (true) {
//           if (myData[i].id == userNum) {
//               myData.splice(i, 1)
//               break
//           }
//           i++
//       }
//       let newData = JSON.stringify(myData)
//       fs.writeFile('list_user.json', newData, function (err) {
//           if (err) throw err;
//           res.redirect('/listuser')
//       })
//   })
// })
// app.get('/update', (req, res) => {
//   let userNum = req.query.userNum
//   fs.readFile('list_user.json', function (err, data) {
//       let obj = JSON.parse(data)
//       let da = fs.readFileSync('list_user.json')
//       let myData = JSON.parse(da)
//       let i = 0
//       let upObj;
//       while (true) {
//           if (myData[i].id == userNum) {
//               upObj = myData[i]
//               break
//           }
//           i++
//       }
//       res.render('updateUser', { layout: 'main', user: upObj, index: userNum })
//   })
  
// })

// app.get('/addUser', (req, res) => {
//   res.render('addUser', { layout: 'main' })
// })
// app.get('/addNew', (req, res) => {
//   let emailRes = req.query.emailRes
//   let passRes = req.query.passRes
//   let nameRes = req.query.nameRes
//   let imgRes = req.query.imgRes
//   fs.readFile('list_user.json', function (err, data) {
//       let obj = JSON.parse(data)
//       let da = fs.readFileSync('list_user.json')
//       let myData = JSON.parse(da)
//       let newObj = { 
//         "id": obj[obj.length - 1].id + 1, 
//       "email": emailRes, 
//       "name": nameRes, 
//       "pass": passRes, 
//       "image": imgRes 
//     }
//       myData.push(newObj)
//       let newData = JSON.stringify(myData)
//       fs.writeFile('list_user.json', newData, function (err) {
//           if (err) throw err;
//           res.redirect('/listuser')
//       })

//   })
// })
// //------------------sản phẩm------------------
// app.get('/listPrs', (req, res) => {
//   let namePr = req.query.namePr
//   let pricePr = req.query.pricePr
//   let imgPr = req.query.imgPr
//   let colorPr = req.query.clPr
//   let typePr = req.query.tPr
//   let idUser = req.query.idKHPr
//   let prNum = req.query.prNum
//   fs.readFile('list_product.json', function (err, data) {
//       if (!prNum) {
//           let obj = JSON.parse(data)
//           res.render('product', { layout: 'main', prData: obj })
//       } else {
//           let da = fs.readFileSync('list_product.json')
//           let myData = JSON.parse(da)
//           for (let i = 0; i < myData.length; i++) {
//               if (myData[i].id == prNum) {
//                   fs.readFile('list_user.json', function (err, data) {
//                       let daU = fs.readFileSync('list_user.json')
//                       let myDataU = JSON.parse(daU)
//                       for (let j = 0; j < myDataU.length; j++) {
//                           if (myDataU[j].id == idUser) {
//                               myData[i].namePr = namePr
//                               myData[i].price = parseInt(pricePr)
//                               myData[i].imgPr = imgPr
//                               myData[i].color = colorPr
//                               myData[i].type = typePr
//                               myData[i].idUser = parseInt(idUser)
//                               myData[i].nameUser = myDataU[j].name
//                               let newData = JSON.stringify(myData)
//                               fs.writeFile('list_product.json', newData, function (err) {
//                                   if (err) throw err;
//                                   res.redirect('/listPrs')
//                               })
//                               break
//                           }
//                           res.redirect('/productlist')
//                           break

//                       }
//                   })
//               }
//           }
//       }

//   })

// })
// app.get('/deletePr', (req, res) => {
//   let prNum = req.query.prNum
//   fs.readFile('list_product.json', function (err, data) {
//       let obj = JSON.parse(data)
//       let da = fs.readFileSync('list_product.json')
//       let myData = JSON.parse(da)
//       let i = 0
//       while (true) {
//           if (myData[i].id == prNum) {
//               myData.splice(i, 1)
//               break
//           }
//           i++
//       }
//       let newData = JSON.stringify(myData)
//       fs.writeFile('list_product.json', newData, function (err) {
//           if (err) throw err;
//           res.redirect('/productlist')
//       })
//   })
// })
// app.get('/updatePr', (req, res) => {
//   let prNum = req.query.prNum
//   fs.readFile('list_product.json', function (err, data) {
//       let obj = JSON.parse(data)
//       let da = fs.readFileSync('list_product.json')
//       let myData = JSON.parse(da)
//       let i = 0
//       let upObj;
//       while (true) {
//           if (myData[i].id == prNum) {
//               upObj = myData[i]
//               break
//           }
//           i++
//       }
//       fs.readFile('list_user.json', function (err, data) {
//           let da = fs.readFileSync('list_user.json')
//           let myDataUsers = JSON.parse(da)
//           res.render('updateProducts', { layout: 'main', user: upObj, index: prNum, listUsers: myDataUsers })
//       })
//   })
// })
// app.get('/addNewPr', (req, res) => {
//   res.render('addProducts', { layout: 'main' })
// })
// app.post('/addNewPr/done', (req, res) => {
//   fs.readFile('list_product.json', function (err, data) {
//       let newPr = req.body
//       let obj = JSON.parse(data)
//       let dataPr = fs.readFileSync('list_product.json')
//       let myData = JSON.parse(dataPr)
//       fs.readFile('list_user.json', function (err, data) {
//           let daU = fs.readFileSync('list_user.json')
//           let myDataU = JSON.parse(daU)
//           for (let j = 0; j < myDataU.length; j++) {
//               if (myDataU[j].id == req.body.idKHPr) {
//                   let newObj = { 
//                     "id": obj[obj.length - 1].id + 1, 
//                     "namePr": req.body.namePr, 
//                     "price": req.body.pricePr, 
//                     "imgPr": req.body.imgPr, 
//                     "color": req.body.clPr, 
//                     "type": req.body.tPr, 
//                     "idUser": parseInt(req.body.idKHPr), 
//                     "nameUser": myDataU[j].name 
//                   }
//                   myData.push(newObj)
//                   console.log(myData);
//                   let newData = JSON.stringify(myData)
//                   fs.writeFile('list_product.json', newData, function (err) {
//                       if (err) throw err;
//                       res.redirect('/productlist')
//                   })
//                   break
//               }
//           }
//           console.log(newPr);

//       })
//   })
// })

// app.get('/', function(req, res){
//   res.render('login');
// });
// app.get('/createAcc', (req, res) => {
//   res.render('signup');
// });
// app.get('/productlist', (req, res) => {
//   fs.readFile('list_product.json', function (err, data) {
//     let obj = JSON.parse(data)
//   res.render('product',{ layout: 'main', prData: obj });
//   })
// });
// app.get('/listuser', (req, res) => {
//   fs.readFile('list_user.json', function (err, data) {
//     let obj = JSON.parse(data)
//   res.render('list',{ layout: 'main', userData: obj });
//   })
// });

app.get('/listUsers', (req, res, next) => {
  usersMod.find({}).then(data_use => {
      data_use = data_use.map(data_use=>data_use.toObject());
      res.render('listUsers', {data: data_use, showHeader: true});
      console.log(data_use);
  }).catch(next)
})

app.post('/listUsers/addUsers', (req, res, next) => {
  let newUser = new usersMod(req.body)
  console.log(newUser)
  newUser.save().then(()=>{
      res.redirect('/listUsers')
  }).catch(next)
})

app.delete('/listUsers/deleteUsers/:id', (req, res, next) => {
  usersMod.deleteOne({_id: req.params.id}).then(() => {
      res.redirect('/listUsers')
  }).catch(next)
})

app.put('/listUsers/updateUsers/:id', (req, res, next) => {
  usersMod.updateOne({_id: req.params.id}, req.body).then(() => {
      res.redirect('/listUsers')
  }).catch(next)
})


app.get('/listProduct', (req, res, next) => {
  productsMod.find({}).then(data_pro => {
      data_pro = data_pro.map(data_pro=>data_pro.toObject());
      res.render('listProducts', {data: data_pro, showHeader: true});
      console.log(data_pro);
  }).catch(next)
})

app.post('/listProduct/addProduct', (req, res, next) => {
  let newProduct = new productsMod(req.body)
  console.log(newProduct)
  newProduct.save().then(()=>{
      res.redirect('/listProduct')
  }).catch(next)
})

app.delete('/listProduct/deleteProduct/:id', (req, res, next) => {
  productsMod.deleteOne({_id: req.params.id}).then(() => {
      res.redirect('/listProduct')
  }).catch(next)
})

app.put('/listProduct/updateProduct/:id', (req, res, next) => {
  productsMod.updateOne({_id: req.params.id}, req.body).then(() => {
      res.redirect('/listProduct')
  }).catch(next)
})


















  http.createServer(function (req, res) {
  fs.readFile('./src/css/product.css', function(err, data) {
    res.writeHead(200, {'Content-Type': 
    'text/css'
  });
    res.write(data);
    return res.end();
  });
}).listen(8040);

  http.createServer(function (req, res) {
  fs.readFile('./src/css/list.css', function(err, data) {
    res.writeHead(200, {'Content-Type': 
    'text/css'
  });
    res.write(data);
    return res.end();
  });
}).listen(8030);

  http.createServer(function (req, res) {
  fs.readFile('./src/css/reset.css', function(err, data) {
    res.writeHead(200, {'Content-Type': 
    'text/css'
  });
    res.write(data);
    return res.end();
  });
}).listen(8020);

  http.createServer(function (req, res) {
  fs.readFile('./src/css/style.css', function(err, data) {
    res.writeHead(200, {'Content-Type': 
    'text/css'
  });
    res.write(data);
    return res.end();
  });
}).listen(8010);