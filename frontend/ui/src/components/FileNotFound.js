import React from 'react';

function FileNotFound() { 
    const flexboxStyles = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px"
    };
    return ( 
        <div style={flexboxStyles} className="container">
            <h3>Error 404: File Not Found.</h3>
        </div>
    );
  }
   
  export default FileNotFound;