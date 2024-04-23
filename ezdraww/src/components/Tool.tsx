import React from 'react';

interface ToolProps {
  setTool: React.Dispatch<React.SetStateAction<string>>;
  tool: string;
}

const Tool: React.FC<ToolProps> = ({ setTool, tool }) => {
  return (
    <>
      <select 
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
        // style={{
        //     position: 'absolute',
        //     top: '5px', // Adjust this value as needed
        //     left: '5px', // Adjust this value as needed
        //     zIndex: '9999', // Ensure it's above other elements if necessary
        //   }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>
    </>
  );
};

export default Tool;
