 var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require('cloudinary');
var method_override = require('method-override');
var Schema = mongoose.Schema;
var app_pass = "12345";

cloudinary.config({
  cloud_name: "dvjlaaaiz",
  api_key: "773718861546939",
  api_secret: "xBQHJhxVzAPwLtGXJTdSMUVUA3M"
});

var app = express();

mongoose.connect("mongodb://localhost/myfirst-back");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest:'./uploads'}));
app.use(method_override("_method"));

var productSchemaJSON = {
    title: String,
    description: String,
    imageUrl: String,
    pricing: Number
};
var productSchema = new Schema(productSchemaJSON);

productSchema.virtual("image.url").get(function() {
  if (this.imageUrl === "" || this.imageUrl === "data.png") {
    return "default.jpg";
  }
  return this.imageUrl;
});

var Product = mongoose.model("Product", productSchema)

app.set("view engine", "jade");

app.use(express.static("public"));

app.get("/", function(req,res) {
  res.render("index");
});

app.get("/menu", function(req, res) {
  Product.find(function(error, doc){
    if (error) { console.log(error); }
    res.render("menu/index", { products: doc });
  });
});

app.post("/menu", function(req, res) {
  if (req.body.password === app_pass) {
    var data = {
      title: req.body.title,
      description: req.body.description,
      pricing: req.body.pricing
    }

    var product = new Product(data);

    if (req.files.hasOwnProperty("image_avatar")) {
      cloudinary.uploader.upload(req.files.image_avatar.path, function(result) {
        product.imageUrl = result.url;
        product.save(function(error){
          console.log(product);
          res.redirect("/menu");
        });
      });
    } else {
      product.save(function(error){
        console.log(product);
        res.redirect("/menu");
      });
    }
  } else {
    res.render("menu/new");
  }
});

app.get("/menu/new", function(req, res) {
  res.render("menu/new");
});


app.put("/menu/:id", function(req, res) {
  if (req.body.password === app_pass) {
    var data = {
      title: req.body.title,
      description: req.body.description,
      pricing: req.body.pricing
    };

    if (req.files.hasOwnProperty("image_avatar")) {
      cloudinary.uploader.upload(req.files.image_avatar.path, function(result) {
        data.imageUrl = result.url;

        Product.update({"_id": req.params.id}, data, function(){
          res.redirect("/menu");
        });
      });
    } else {
      Product.update({"_id": req.params.id}, data, function(){
        res.redirect("/menu");
      });
    }

  } else {
    res.redirect("/");
  }
});

app.get("/menu/edit/:id", function(req, res) {
  var product_id = req.params.id;
  console.log(product_id);
  Product.findOne({"_id": product_id}, function(error, product) {
    console.log(product);
    res.render("menu/edit", {product: product});
  });

});

app.get("/menu/delete/:id", function(req, res) {
  var id = req.params.id;
  Product.findOne({"_id": id}, function(error, product){
    res.render("menu/delete", { product: product });
  });
});

app.delete("/menu/:id", function(req, res) {
  var id = req.params.id;
  if (req.body.password === app_pass) {
    Product.remove({"_id": id}, function(err) {
      if (err) { console.log(err); }
      res.redirect("/menu");
    });
  } else {
    res.redirect("/menu");
  }
});


app.get("/admin", function(req, res) {
  res.render("admin/form");
});

app.post("/admin", function(req, res) {
  if (req.body.password === app_pass) {
    Product.find(function(error, doc){
      if (error) { console.log(error); }
      res.render("admin/index", { products: doc });
    });
  } else {
    res.redirect("/");
  }
});

app.listen(8080);
