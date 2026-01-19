import React from 'react';
import './Loader.css';

function Loader() {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="magenta"></div>
        <div className="cyan"></div>
      </div>
    </div>
  );
}

export default Loader;