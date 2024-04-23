import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';

interface ColorpickProps {
  color: string;
  handleColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Colorpick: React.FC<ColorpickProps> = ({ color, handleColorChange }) => {
  return (
    <Container className="mt-5">
      <h3>Color Picker</h3>
      <Row className="align-items-center">
        <Col md={6} className="d-flex justify-content-center">
          <Form.Control
            type="color"
            value={color}
            onChange={handleColorChange}
            className="form-control-color mt-2"
          />
        </Col>
        <Col md={6}>
          <div
            className="preview-color"
            style={{
              backgroundColor: color,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
            }}
          ></div>
          <p className="mt-2">Selected Color: {color}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Colorpick;
