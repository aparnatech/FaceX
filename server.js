const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const data = require('./routes/datas');
const socket = require('socket.io');
const port = process.env.PORT || 5000; 

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cors());
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB

app.use('/api', data);
app.use('/api/auth', require('./routes/auth'));
mongoose.connect(db,{ useNewUrlParser: true, useCreateIndex:true },(db,err) => {
  if(err) {
    console.log(err);
    return false;
  }
  console.log("Connected to MongoDB");

  const server = app.listen(port, () => {
    console.log("Server started on port " + port + "...");
  });
  const io = socket.listen(server);
  io.sockets.on('connection', (socket) => {
 
   socket.on("initial_data", () => {
    db.collection("users").find({}).then(docs => {
      io.sockets.emit("get_data", docs);
    });
  });

  socket.on("updated_data", order => {
    db.collection("users")
      .update({ _id: order._id },  { "$set": { "role": role, "age": age, "name": name , "email": email}})
      .then(updatedDoc => {
        // Emitting event to update 
        io.sockets.emit("updated",updatedDoc);
      });
  }); 

  socket.on("deletion", deleted_data => {
    db.collection("users")
      .delete(
        { _id: deleted_data._id }       )
      .then(deleted_data => {
        // Socket event to delete
        io.sockets.emit("deleted");
      });
  });

});
});
  

app.listen(port, () => console.log(`Server up and running on port ${port} !`));