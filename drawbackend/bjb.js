
let roomIdg,messageg;
socket.on("whiteboarddata",(data)=>{
  messageg=data.message;
  socket.broadcast.to(roomIdg).emit("whiteboardrespponse",{message:messageg});
  console.log(roomIdg);
  io.to(roomIdg).emit("whiteboardresponse", { message: "Initial message" });


});

  console.log("hello1");
  socket.on("userjoined",(data)=>{
      console.log("hello2");
      const {name,userId,roomId,host,presenter}=data;
      roomIdg=roomId;
      socket.join(roomId);



      
      console.log("hello3");
      socket.emit("userIsJoined",{success:true,roomId:roomId})

      socket.broadcast.to(roomIdg).emit("whiteboardresponse",{message:"initial messageg"});
      io.to(roomId).emit("whiteboardresponse", { message: "Initial message" });
      


  })
  socket.on("sendmessage",(data)=>{
    console.log(data.message);
  })
  // socket.on('joinRoom', (roomName) => {
  //     socket.join(roomName);
  //     roomClients[roomName] = roomClients[roomName] || [];
  //     roomClients[roomName].push(socket.id);
  //   });
  
    // Listen for drawing events from clients in the room
    socket.on('drawing', (data) => {
      // Broadcast the drawing data to all other clients in the same room
      console.log(data.message);
      socket.to("hc2eu0zpj").emit("drawing",data);
      console.log(roomIdg);
      io.to(roomIdg).emit("whiteboardresponse", { message: "Initial message" });

      socket.emit('drawing', data);
    });
  