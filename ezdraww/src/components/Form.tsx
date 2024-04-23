import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface RoomData {
  name: string;
  roomId: string;
  userId: string;
  host: boolean;
  presenter: boolean;
  success: boolean;
}

interface FormProps {
  setUser: React.Dispatch<React.SetStateAction<RoomData | null>>;
  uuid?: string;
  socket: Socket;
}

const CreateRoomForm: React.FC<FormProps> = ({ setUser, uuid, socket }) => {
  const [name, setName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');

  const navigate = useNavigate();

  const generateUniqueId = () => {
    const uniqueId = Math.random().toString(36).substr(2, 9);
    setRoomId(uniqueId);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const createRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const roomData: RoomData = {
      name,
      roomId,
      userId: "kkk",
      host: true,
      presenter: true,
      success: true
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userjoined", roomData);
    console.log(`Room created with name: ${name} and ID: ${roomId}`);
  };

  return (
    <div className="container">
      <h2>Create Room</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="nameInput" className="form-label">Enter Name</label>
          <input type="text" className="form-control" id="nameInput" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="roomIdInput" className="form-label">Unique ID</label>
          <div className="input-group">
            <input type="text" className="form-control" id="roomIdInput" value={roomId} readOnly />
            <button type="button" className="btn btn-outline-secondary" onClick={generateUniqueId}>Generate Unique ID</button>
            <button type="button" className="btn btn-outline-secondary" onClick={copyRoomId}>Copy ID</button>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={createRoom}>Create Room</button>
      </form>
    </div>
  );
};

const JoinRoomForm: React.FC<FormProps> = ({ setUser, socket }) => {
  const [name, setName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');

  const navigate = useNavigate();

  const joinRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const roomData: RoomData = {
      name,
      roomId,
      userId: "kpp",
      host: false,
      presenter: false,
      success: true
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userjoined", roomData);
    console.log(`Joined room with name: ${name} and ID: ${roomId}`);
  };

  return (
    <div className="container">
      <h2>Join Room</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="joinNameInput" className="form-label">Name</label>
          <input type="text" className="form-control" id="joinNameInput" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="joinRoomIdInput" className="form-label">Room ID</label>
          <input type="text" className="form-control" id="joinRoomIdInput" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary" onClick={joinRoom}>Join Room</button>
      </form>
    </div>
  );
};

const Formm: React.FC<FormProps> = ({ setUser, uuid, socket }) => {
  return (
    <>
      <CreateRoomForm setUser={setUser} uuid={uuid} socket={socket} />
      <JoinRoomForm setUser={setUser} socket={socket} />
    </>
  );
};

export default Formm;
