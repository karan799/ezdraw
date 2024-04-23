import React from 'react';

interface SliderProps {
  handleSliderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  size: number;
}

const Slider: React.FC<SliderProps> = ({ handleSliderChange, size }) => {
  return (
    <div>
      <div>
        <input
          type="range"
          min="0"
          max="100"
          value={size}
          onChange={handleSliderChange}
          style={{ width: '100%', margin: '20px auto' }}
        />
        <div>Size: {size}</div>
      </div>
    </div>
  );
};

export default Slider;
