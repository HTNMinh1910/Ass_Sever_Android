const express = require("express");
const app = express();
const fs = require('fs');
const http = require('http');
const hbs = require("express-handlebars");
const path = require("path");
const multer = require('multer');
const bodyParser = require('body-parser')
const { json } = require('express')

app.engine('hbs', hbs.engine());
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));
app.set('views', path.join(__dirname, '/src/views'));
app.listen(8080);


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      dir = ('./public/uploads')
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

app.get('/login', function(req, res){
    let email = req.query.email;
    let pass = req.query.password;
    let check = false
    fs.readFile('list_user.json', function (err, data) {
        let obj = JSON.parse(data)
        for (let i = 0; i < obj.length; i++) {
            if (email == obj[i].email && pass == obj[i].pass) {
             check = true 
            }
          }
          if (check) {
            res.render('list', { layout: 'main', userData: obj })
        } else {
            res.render('login', { layout: 'main', wrong: true })
        }
    })
});

app.post('/sign_up', (req, res) => {
    let email = req.body.email
    let pass = req.body.password
    let name = req.body.name
    fs.readFile('list_user.json', function (err, data) {

        let obj = JSON.parse(data)
        let dataUse = fs.readFileSync('list_user.json')
        let myData = JSON.parse(dataUse)
        let arr = req.body.image.split('.')
        let newFilename = arr[0] + '-' + Date.now() + '.' + arr[1]
        let newObj = {
          "id": obj[obj.length - 1].id + 1, 
          "email": email,
          "name": name,
          "pass": pass,
          "image": "" 
          }
        myData.push(newObj)
        let newData = JSON.stringify(myData)
        fs.writeFile('list_user.json', newData, function () {
            res.render('login', { layout: 'main', wrong: false })
        })
        console.log(myData);
    })
});

app.get('/list', (req, res) => {
  let emailUser = req.query.email
  let passUser = req.query.password
  let nameUser = req.query.name
  let imgUser = req.query.img
  let userNum = req.query.userNum
  fs.readFile('list_user.json', function (err, data) {
      if (!userNum) {
          let obj = JSON.parse(data)
          res.render('home', { layout: 'main', userData: obj })
      } else {
          let da = fs.readFileSync('list_user.json')
          let myData = JSON.parse(da)
          for (let i = 0; i < myData.length; i++) {
              if (myData[i].id == userNum) {
                  myData[i].email = emailUser
                  myData[i].pass = passUser
                  myData[i].name = nameUser
                  myData[i].image = imgUser
                  break
              }
          }
          let newData = JSON.stringify(myData)
          fs.writeFile('list_user.json', newData, function (err) {
              if (err) throw err;
              res.redirect('/listuser')
          })
      }
  })
})
app.get('/delete', (req, res) => {
  let userNum = req.query.userNum
  fs.readFile('list_user.json', function (err, data) {
      let obj = JSON.parse(data)
      let dataUse = fs.readFileSync('list_user.json')
      let myData = JSON.parse(dataUse)
      let i = 0
      while (true) {
          if (myData[i].id == userNum) {
              myData.splice(i, 1)
              break
          }
          i++
      }
      let newData = JSON.stringify(myData)
      fs.writeFile('list_user.json', newData, function (err) {
          if (err) throw err;
          res.redirect('/listuser')
      })
  })
})
app.get('/update', (req, res) => {
  let userNum = req.query.userNum
  fs.readFile('list_user.json', function (err, data) {
      let obj = JSON.parse(data)
      let da = fs.readFileSync('list_user.json')
      let myData = JSON.parse(da)
      let i = 0
      let upObj;
      while (true) {
          if (myData[i].id == userNum) {
              upObj = myData[i]
              break
          }
          i++
      }
      res.render('updateUser', { layout: 'main', user: upObj, index: userNum })
  })
  
})

app.get('/addUser', (req, res) => {
  res.render('addUser', { layout: 'main' })
})
app.get('/addNew', (req, res) => {
  let emailRes = req.query.emailRes
  let passRes = req.query.passRes
  let nameRes = req.query.nameRes
  let imgRes = req.query.imgRes
  fs.readFile('list_user.json', function (err, data) {
      let obj = JSON.parse(data)
      let da = fs.readFileSync('list_user.json')
      let myData = JSON.parse(da)
      let newObj = { "id": obj[obj.length - 1].id + 1, "email": emailRes, "name": nameRes, "pass": passRes, "image": imgRes }
      myData.push(newObj)
      let newData = JSON.stringify(myData)
      fs.writeFile('list_user.json', newData, function (err) {
          if (err) throw err;
          res.redirect('/listuser')
      })

  })
})
//------------------sản phẩm------------------
app.get('/listPrs', (req, res) => {
  let namePr = req.query.namePr
  let pricePr = req.query.pricePr
  let imgPr = req.query.imgPr
  let colorPr = req.query.clPr
  let typePr = req.query.tPr
  let idUser = req.query.idKHPr
  let prNum = req.query.prNum
  fs.readFile('list_product.json', function (err, data) {
      if (!prNum) {
          let obj = JSON.parse(data)
          res.render('product', { layout: 'main', prData: obj })
      } else {
          let da = fs.readFileSync('list_product.json')
          let myData = JSON.parse(da)
          for (let i = 0; i < myData.length; i++) {
              if (myData[i].id == prNum) {
                  fs.readFile('list_user.json', function (err, data) {
                      let daU = fs.readFileSync('list_user.json')
                      let myDataU = JSON.parse(daU)
                      for (let j = 0; j < myDataU.length; j++) {
                          if (myDataU[j].id == idUser) {
                              myData[i].namePr = namePr
                              myData[i].price = parseInt(pricePr)
                              myData[i].imgPr = imgPr
                              myData[i].color = colorPr
                              myData[i].type = typePr
                              myData[i].idUser = parseInt(idUser)
                              myData[i].nameUser = myDataU[j].name
                              let newData = JSON.stringify(myData)
                              fs.writeFile('list_product.json', newData, function (err) {
                                  if (err) throw err;
                                  res.redirect('/listPrs')
                              })
                              break
                          }
                          res.redirect('/productlist')
                          break

                      }
                  })
              }
          }
      }

  })

})
app.get('/deletePr', (req, res) => {
  let prNum = req.query.prNum
  fs.readFile('list_product.json', function (err, data) {
      let obj = JSON.parse(data)
      let da = fs.readFileSync('list_product.json')
      let myData = JSON.parse(da)
      let i = 0
      while (true) {
          if (myData[i].id == prNum) {
              myData.splice(i, 1)
              break
          }
          i++
      }
      let newData = JSON.stringify(myData)
      fs.writeFile('list_product.json', newData, function (err) {
          if (err) throw err;
          res.redirect('/productlist')
      })
  })
})
app.get('/updatePr', (req, res) => {
  let prNum = req.query.prNum
  fs.readFile('list_product.json', function (err, data) {
      let obj = JSON.parse(data)
      let da = fs.readFileSync('list_product.json')
      let myData = JSON.parse(da)
      let i = 0
      let upObj;
      while (true) {
          if (myData[i].id == prNum) {
              upObj = myData[i]
              break
          }
          i++
      }
      fs.readFile('list_user.json', function (err, data) {
          let da = fs.readFileSync('list_user.json')
          let myDataUsers = JSON.parse(da)
          res.render('updateProducts', { layout: 'main', user: upObj, index: prNum, listUsers: myDataUsers })
      })
  })
})
app.get('/addNewPr', (req, res) => {
  res.render('addProducts', { layout: 'main' })
})
app.post('/addNewPr/done', (req, res) => {
  fs.readFile('list_product.json', function (err, data) {
      let newPr = req.body
      let obj = JSON.parse(data)
      let dataPr = fs.readFileSync('list_product.json')
      let myData = JSON.parse(dataPr)
      fs.readFile('list_user.json', function (err, data) {
          let daU = fs.readFileSync('list_user.json')
          let myDataU = JSON.parse(daU)
          for (let j = 0; j < myDataU.length; j++) {
              if (myDataU[j].id == newPr.idKHPr) {
                  let newObj = { "id": obj[obj.length - 1].id + 1, "namePr": newPr.namePr, "price": newPr.pricePr, "imgPr": newPr.imgPr, "color": newPr.clPr, "type": newPr.tPr, "idUser": parseInt(newPr.idKHPr), "nameUser": myDataU[j].name }
                  myData.push(newObj)
                  console.log(myData);
                  let newData = JSON.stringify(myData)
                  fs.writeFile('list_product.json', newData, function (err) {
                      if (err) throw err;
                      res.redirect('/productlist')
                  })
                  break
              }
          }
          console.log(newPr);

      })
  })
})

app.get('/', function(req, res){
  res.render('login');
});
app.get('/createAcc', (req, res) => {
  res.render('signup');
});
app.get('/productlist', (req, res) => {
  fs.readFile('list_product.json', function (err, data) {
    let obj = JSON.parse(data)
  res.render('product',{ layout: 'main', prData: obj });
  })
});
app.get('/listuser', (req, res) => {
  fs.readFile('list_user.json', function (err, data) {
    let obj = JSON.parse(data)
  res.render('list',{ layout: 'main', userData: obj });
  })
});






















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