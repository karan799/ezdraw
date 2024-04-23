import React, { useEffect, useState } from 'react';
import viteLogo from './vite.svg'; // Assuming 'vite.svg' is in the same directory
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Draw from './components/Draw';
import io, { Socket } from "socket.io-client"; // Import Socket type from 'socket.io-client'

import { Route, Routes } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Formm from './components/Form';
import Draww from './components/Draww';
import Auth from './components/Login';
import Register from './components/Register';
import Login from './components/Login';
import { AuthProvider } from './components/Auth';

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionsAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket: Socket = io(server, connectionOptions); // Define socket as Socket type

socket.on("connect_error", (err) => {
  console.log(err.message);

});

function App() {
  const [user, setUser] = useState<any>(null); // Define user state with 'any' type
  const uuid = Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    console.log("in effect");
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        console.log(`userJoined with roomId${data.roomId}`);
      } else {
        console.log("userJoin error");
      }
    });
  }, []); // Add empty dependency array to run effect only once

  console.log("in effect2");

  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on("disconnect", () => {
    console.log(socket.id); // undefined (Note: 'socket.idd' seems incorrect)
  });

  return (
    <>
   
   <AuthProvider>
      <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />

        <Route path="/form" element={<Formm uuid={uuid} socket={socket} setUser={setUser} />} />
        <Route path="/:roomid" element={<Draww socket={socket} user={user} />} />
      </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
