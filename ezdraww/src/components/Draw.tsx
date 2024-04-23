import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Circle } from 'react-konva';
import Slider from './Slider';
import Colorpick from './Colorpick';
import Tool from './Tool';
import { Socket } from 'socket.io-client';
import Konva from 'konva';

interface LineData {
  tool: string;
  points: number[];
  size: number;
  color: string;
}

interface CursorPosition {
  x: number;
  y: number;
}

interface RemoteCursors {
  [userId: string]: CursorPosition;
}

interface DrawProps {
  user?: any;
  socket: Socket;
}

const Draw: React.FC<DrawProps> = ({ user, socket }) => {
  const [tool, setTool] = useState<string>('pen');
  const [size, setSize] = useState<number>(5);
  const [color, setColor] = useState<string>('#000000');
  const [lines, setLines] = useState<LineData[]>([]);
  const [lines2, setLines2] = useState<LineData[]>([]);
  const isDrawing = useRef<boolean>(false);
  const history = useRef<LineData[][]>([]);
  const historyStep = useRef<number>(0);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursors>({});
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });

  useEffect(() => {
    socket.on('mousedown', (data) => {
      console.log("mousedowm");
      
      setLines((prevLines) => [...prevLines, data.lines]);
    });

    return () => {
      socket.off('mousedown');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('cursorMove', (data) => {
      console.log("cursormove");
      
      if(data.message)
      {
        console.log(data.message);
        
      }
      setRemoteCursors((prevCursors) => ({
        ...prevCursors,
        [data.userId]: data.position,
      }));
    });

    return () => {
      socket.off('cursorMove');
    };
  }, [socket]);
  useEffect(() => {
    socket.on('roomcheck', (data) => {
      console.log("roomcheck");
      
      if(data.message)
      {
        console.log(data.message);
        
      }
      
    });

    return () => {
      socket.off('cursorMove');
    };
  }, [socket]);

  useEffect(() => {
  
    
    socket.emit('cursorMove', { position: cursorPosition });

    return () => {
      socket.off('cursorMove');
    };
  }, [cursorPosition, socket]);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value));
  };

  const saveToHistory = () => {
    socket.emit('drawing', { message: 'mousedown', lines: lines[lines.length - 1] });

    const linesCopy = JSON.parse(JSON.stringify(lines));
    history.current.push(linesCopy);
    historyStep.current += 1;
  };

  const undo = () => {
    if (historyStep.current === -1) return;
    historyStep.current -= 1;
    setLines(history.current[historyStep.current]);
  };

  const redo = () => {
    if (historyStep.current === history.current.length - 1) return;
    historyStep.current += 1;
    setLines(history.current[historyStep.current]);
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const pos = e?.target.getStage()?.getPointerPosition();


    if (historyStep.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyStep.current + 1);
    }
    const x = pos?.x ?? 0; // Default to 0 if pos is null or undefined
const y = pos?.y ?? 0; 

    setLines([...lines, { tool, points: [x, y], size, color }]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();

    if (point) {
        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        const updatedLines = [...lines];
        updatedLines.splice(lines.length - 1, 1, lastLine);
        setLines(updatedLines);
      }
      
  };

  const handleMouseUp = () => {
    saveToHistory();
    isDrawing.current = false;
  };

  return (
    <div style={{ position:'relative', }}>
      <div>
        {user?.presenter && (
          <>
            <Slider handleSliderChange={handleSliderChange} size={size} />
            <Colorpick color={color} handleColorChange={handleColorChange} />
            <Tool tool={tool} setTool={setTool} />
            <div>
              <button onClick={undo}>Undo</button>
              <button onClick={redo}>Redo</button>
            </div>
          </>
        )}
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
        >
          <Layer>
            <Text text="Just start drawing" x={5} y={30} />
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
          </Layer>
          <Layer>
          {Object.entries(remoteCursors).map(([userId, position]) => (
    position !== null && position !== undefined && ( // Add a conditional check here
        <Circle key={userId} x={position.x || 0} y={position.y || 0} radius={5} fill="red" />
    )
))}
          </Layer>
        </Stage>
        {/* <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
        >
          <Layer>
            <Text text="Just start drawing" x={5} y={30} />
            {lines2.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
          </Layer> */}
          {/* <Layer>
          {Object.entries(remoteCursors).map(([userId, position]) => (
    position !== null && position !== undefined && ( // Add a conditional check here
        <Circle key={userId} x={position.x || 0} y={position.y || 0} radius={5} fill="red" />
    )
))}
          </Layer>
        </Stage> */}
      </div>
     <div>
     <div className="absolute left-10 top-[50%] z-50 grid grid-cols-2 items-center gap-5 rounded-lg bg-zinc-900 p-5 text-white 2xl:grid-cols-1" data-projection-id="4" style={{ transform: 'translateX(-160px) translateY(-50%) translateZ(0px)' }}>
      <button className="btn-icon text-xl" disabled>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"></path>
        </svg>
      </button>
      {/* Add more buttons and elements here */}
    </div>
     </div>
     <div>
     <div className="d-flex flex-column flex-shrink-0 bg-body-tertiary" style={{ width: '4.5rem',  position:'absolute', border:'2px', top:"10%", left:'5%' }}>
      <a href="/" className="d-block p-3 link-body-emphasis text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-original-title="Icon-only">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
</svg>
        <span className="visually-hidden">Icon-only</span>
      </a>
      <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
        <li className="nav-item">
          <a href="#" className="nav-link active py-3 border-bottom rounded-0" aria-current="page" data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Home" data-bs-original-title="Home">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" className="bi bi-eraser" viewBox="0 0 16 16">
  <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
</svg>
</a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Dashboard" data-bs-original-title="Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
</svg>    </a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Orders" data-bs-original-title="Orders">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
</svg>          </a>
        </li>
        <div>
        <li >
          <a href="#" className="nav-link py-3 border-bottom rounded-0" data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Products" data-bs-original-title="Products">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" className="bi bi-record-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
</svg>          </a>
        </li> 
        {true && (
                <div
                //   ref={sliderRef}
                  style={{
                    position: 'absolute',
                    top: 80,
                    left: 30,
                    transform: 'translate(-50%, -50%)', // Center the slider
                  }}
                >
                  {/* Your Slider component here */}
                  <Slider handleSliderChange={handleSliderChange} size={size} />
                </div>
              )}
              {/* Other components and buttons */}
            </div>
        <i className="bi bi-eraser">masknq</i>        
      </ul>  
    </div>
     </div>
               
                
     
    </div>
  );
};

export default Draw;
