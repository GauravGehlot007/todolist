  const express = require("express");
  const bodyParser = require("body-parser");
  const mongoose = require("mongoose");
  const _ = require("lodash");
  const app = express();
   
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(express.static("public"));
        app.set("view engine", "ejs");

  mongoose.connect('mongodb+srv://admin-gaurav:Test123@cluster0.tgzkavt.mongodb.net/todolistDB');

    const itemsSchema = new mongoose.Schema({
      name : String
  });

  const listSchema = new mongoose.Schema({
    name: String,
    item: [itemsSchema]
  });

  const Item = mongoose.model("item",itemsSchema);

  const apple = new Item ({
    name: "Apple"
  });

  const mango = new Item ({
      name: "Mango"
    });

  const banana = new Item ({
      name: "Banana"
    });

    const defaultItem = [apple, mango, banana];

    const List = mongoose.model("List", listSchema);
    
  async function getItems(){
    const Items = await Item.find({});
    return Items;
  } 

  async function getList(){
    const Lists = await List.findOne({});
    return Lists;
  }

    app.get("/",function(req, res){

        getItems().then(function(foundItems){
          
          if(foundItems.length === 0){
              Item.insertMany(defaultItem).then(function () { 
              console.log("Successfully saved defult items to DB");
              })
              .catch(function (err) {
              console.log(err);
              });
              res.redirect("/");
            } 
            
          else{
            res.render("list",{listTitle: "Today", newListItem: foundItems});
          }
          });
      });

  app.post("/",async function(req, res){
      const itemName = req.body.newItem; 
      const listName = req.body.list;

        const item = new Item ({
        name: itemName
      });

       if(listName === "Today"){
        item.save();
        res.redirect("/");
       }
       else {
        const foundList = await List.findOne({name: listName}).exec();
        
        foundList.item.push(item);
        foundList.save();
        res.redirect("/" + listName);
       }       
        
  });

  app.post("/delete", function(req,res){
    const checkboxItem = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove(checkboxItem).exec();
      res.redirect("/"); 
    }
    else{
      List.findOneAndUpdate({name: listName},{$pull:{item: {_id: checkboxItem}}},).exec();
      res.redirect("/" + listName);
    }
     
    
  });

  app.get("/:customListName", async function(req,res){
      
      const customListName = _.capitalize(req.params.customListName);
      

        try {
          const foundList = await List.findOne({ name: customListName }).exec();
          
          if (!foundList) {
            const list = new List({
                      name: customListName,
                      item: defaultItem
                    });
                  list.save();
                  res.redirect("/"+ customListName);
          } else {
            res.render("list", {listTitle: foundList.name, newListItem: foundList.item});
            
          }
        } catch (error) {
            console.log(error);
        }

  });

  // app.get("/work",function(req,res){
  //   res.render("list",{listTitle: "Work List", newListItem: workItems}); 
  // });
  
  app.get("/about",function(req,res){
  res.render("about");
  });

  app.listen(3000,function(){
      console.log("server running at port 3000");
  });
