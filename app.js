const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

mongoose.connect("mongodb+srv://admin-kunal:test123@cluster0.0mx8qku.mongodb.net/todoListDB", { useNewUrlParser: true });

// 1. Schema
const itemsSchema = new mongoose.Schema({
    name: String
});

// 2. Model
const Item = mongoose.model("Item", itemsSchema);

// 3. Documents
const todoItemOne = new Item({
    name: "Welcome to your todolist!"
});

const todoItemTwo = new Item({
    name: "Hit the + button to add a new item."
});

const todoItemThree = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [todoItemOne, todoItemTwo, todoItemThree]

// 1. Schema
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

// 2. Model
const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved the documents");
                }
            });

            res.redirect("/");
        }

        res.render("list", {
            listTitle: "Today",
            listItems: foundItems
        });
    });
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();

                res.redirect("/" + customListName);
            } else {
                // Show an existing list

                res.render("list", {
                    listTitle: foundList.name,
                    listItems: foundList.items
                });
            }
        }
    });
});

app.post("/", function (req, res) {

    const listName = req.body.listSubmit;
    const itemName = req.body.newTodo;

    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            if (!err) {
                if (foundList) {
                    foundList.items.push(newItem);
                    foundList.save();

                    res.redirect("/" + listName);
                }
            }
        });
    }

});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    // Home Route
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log("Error deleting item");
            } else {
                console.log("Successfully deleted the item");
            }
        });

        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port);

/*const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
var items = ["Buy Food"];
let workItems = [];

const app = express();

app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/todoListDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const todoItemOne = new Item({
    name: "Welcome to your todolist!"
});

const todoItemTwo = new Item({
    name: "Hit the + button to add a new item."
});

const todoItemThree = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [todoItemOne, todoItemTwo, todoItemThree]

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

// 2. Model
const List = mongoose.model("List", listSchema);


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved the documents");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    });

});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();

                res.redirect("/" + customListName);
            } else {
                // Show an existing list

                res.render("list", {
                    listTitle: foundList.name,
                    listItems: foundList.items
                });
            }
        }
    });
});

app.post('/', function (req, res) {
    //console.log(req.body.newItem)
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            if (!err) {
                if (foundList) {
                    foundList.items.push(item);
                    foundList.save();

                    res.redirect("/" + listName);
                }
            }
        });
    }
});



app.post('/delete', function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    //const listName = req.body.listName;

    // Home Route

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log("Error deleting item");
            } else {
                console.log("Successfully deleted the item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});
/*app.post('/work', function (req, res) {
    //console.log(req.body.newItem)
    var item = req.body.newItem;
    workitems.push(item);
    //res.render("list", { newListItem: item });
    res.redirect("/work");
});*/

/*
app.listen(3000, function () {
    console.log("Server is running on port 3000");     
});                                                      //Part of original code 
*/


/*var currentDay = today.getDay();
    var day = "";
    switch (currentDay) {
        case 0: day = "Sunday";
            break;
        case 1: day = "Monday";
            break;
        case 2: day = "Tuesday";
            break;
        case 3: day = "Wednesday";
            break;
        case 4: day = "Thursday";
            break;
        case 5: day = "Friday";
            break;
        case 0: day = "Saturday";
            break;
        default: console.log("Error");
    }*/