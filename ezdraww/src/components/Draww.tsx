import Konva from 'konva';
import Slider from './Slider';
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Circle } from 'react-konva';
import Colorpick from './Colorpick';
import Tool from './Tool';
import { Socket } from 'socket.io-client';

interface DrawProps {
  user?: any;
  socket: Socket;
}
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
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [showSize, setShowSize] = useState<boolean>(false);
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
      console.log("dowm");

      setLines((prevLines) => [...prevLines, data.lines]);
    });
    socket.on('room', (data) => {
      console.log(data.message);

    });

    return () => {
      socket.off('mousedown');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('cursorMove', (data) => {
      console.log("rmove");

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
    socket.emit('cursorMove', { position: cursorPosition });

    return () => {
      socket.off('cursorMove');
    };
  }, [cursorPosition, socket]);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  

  const saveToHistory = () => {
    socket.emit('drawing', { message: 'mousedown', lines: lines[lines.length - 1] });

    const linesCopy = JSON.parse(JSON.stringify(lines));
    history.current.push(linesCopy);
    historyStep.current += 1;
  };

  const undo = () => {
    console.log(historyStep.current);

    if (historyStep.current <=1) 
    {
      historyStep.current=0;


      setLines([]);
      return;
    }
    historyStep.current -= 1;
    console.log(history.current);
    
    setLines(history.current[historyStep.current-1]);
  };

  const redo = () => {
    console.log(historyStep.current,history.current.length - 1);
    
    if (historyStep.current === history.current.length - 1)
    return;
    
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


  const handleToolClick = (selectedTool: string) => {
    if (selectedTool === tool) {
      setTool('');
    } else {
      setTool(selectedTool);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value));
  };

  const toggleColorPalette = () => {
    setShowColorPalette(!showColorPalette);
  };
  const toggleSize = () => {
    setShowSize(!showSize);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-2 position-fixed top-0 start-0 bg-light p-4 " style={{ zIndex: 100 }}>
          <h5 className="mb-4">Tools</h5>
          <ul className="list-group">
            {/* Pen */}
            <li className="list-group-item">
              <button className="btn btn-link" onClick={() => handleToolClick('pen')}>
                <i className="bi bi-pencil"></i> Pen
              </button>
            </li>
            {/* Eraser */}
            <li className="list-group-item">
              <button className="btn btn-link" onClick={() => handleToolClick('eraser')}>
                <i className="bi bi-eraser"></i> Eraser
              </button>
            </li>
            {/* Size Slider */}
            {tool === 'pen' && (
              <li className="list-group-item">
                <Slider handleSliderChange={handleSliderChange} size={size} />
              </li>
            )}
            {/* Undo */}
            <li className="list-group-item">
              <button className="btn btn-link" onClick={() => undo()}>
                <i className="bi bi-arrow-counterclockwise"></i> Undo
              </button>
            </li>
            {/* Redo */}
            <li className="list-group-item">
              <button className="btn btn-link" onClick={() => redo()}>
                <i className="bi bi-arrow-clockwise"></i> Redo
              </button>
            </li>
            {/* Color Palette Button */}
            <li className="list-group-item position-relative">
              <button className="btn btn-link" onClick={toggleColorPalette}>
                <i className="bi bi-palette"></i> Color Palette
              </button>
              

              {showColorPalette && (
                <div className="position-absolute top-0 start-100 translate-middle-y p-2 bg-white border rounded shadow">
                  {/* Include your color palette component here */}
                  <Colorpick color={color} handleColorChange={handleColorChange} />
                  <div>Color Palette Component</div>
                </div>
              )}
            </li>
            <li className="list-group-item position-relative">
              <button className="btn btn-link" onClick={toggleSize}>
                <i className="bi bi-palette"></i> Size
              </button>
              {/* Color Palette */}
              {showSize && (
                <div className="position-absolute top-0 start-100 translate-middle-y p-2 bg-white border rounded shadow">
                  <Slider handleSliderChange={handleSliderChange} size={size} />
                  <div>Color Palette Component</div>
                </div>
              )}
            </li>
          </ul>
        </div>
        {/* Whiteboard */}
        <div className=" col-10 offset-2">
          <Stage width={window.innerWidth} height={window.innerHeight}
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
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default Draw;
