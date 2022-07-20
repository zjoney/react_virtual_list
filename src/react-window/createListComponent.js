import React from "react";

function createListComponent({

}) {
  return class extends React.Component {
    render() {
      const { width, height } = this.props;
      const containerStyle = { position: 'relative', width, height, overflow: 'auto', willChange: 'transform' }
      return (
        <div style={containerStyle}>
          <div>
            
          </div>
        </div>
      )
    }
  }
}

export default createListComponent;