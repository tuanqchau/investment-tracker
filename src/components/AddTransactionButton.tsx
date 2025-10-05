import React from 'react';
import styled from 'styled-components';
interface AddTransactionButtonProps {
  onClick?: () => void; // optional click handler
  name?: string; // optional name prop
  fullWidth?: boolean; // optional fullWidth prop
}
const AddTransactionButton = ({ onClick, name, fullWidth }: AddTransactionButtonProps) => {
  return (
    <StyledWrapper>
      <button className="animated-button" onClick={onClick}>
        <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
        <span className="text">{name}</span>
        <span className="circle" />
        <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $fullWidth?: boolean }>`
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")}; /* ✅ make full width if prop is set */

  .animated-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center; /* ✅ center text properly */
    gap: 4px;
    width: 100%; /* ✅ ensures button fills wrapper width */
    padding: 16px 36px;
    border: 4px solid transparent;
    font-size: 16px;
    background-color: inherit;
    border-radius: 10px;
    font-weight: 600;
    color: greenyellow;
    box-shadow: 0 0 0 2px greenyellow;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button svg {
    position: absolute;
    width: 24px;
    fill: greenyellow;
    z-index: 9;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button .arr-1 {
    right: 16px;
  }

  .animated-button .arr-2 {
    left: -25%;
  }

  .animated-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    /* make disc much larger than button so it always covers it */
    width: 400%;
    height: 400%;
    transform: translate(-50%, -50%) scale(0.001);
    background-color: greenyellow;
    border-radius: 50%;
    opacity: 0;
    z-index: 1; /* behind text (z-index:2) but above base (z-index:0) */
    transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s;
    will-change: transform, opacity;
    pointer-events: none;
  }

  .animated-button .text {
    position: relative;
    z-index: 2;
    transform: translateX(-12px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button:hover {
    box-shadow: 0 0 0 12px transparent;
    color: #212121;
    border-radius: 8px;
  }

  .animated-button:hover .arr-1 {
    right: -25%;
  }

  .animated-button:hover .arr-2 {
    left: 16px;
  }

  .animated-button:hover .text {
    transform: translateX(12px);
  }

  .animated-button:hover svg {
    fill: #212121;
  }

  .animated-button:active {
    scale: 0.95;
    box-shadow: 0 0 0 4px greenyellow;
  }

  /* expand the circle to cover the button */
  .animated-button:hover .circle {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
`;

export default AddTransactionButton;