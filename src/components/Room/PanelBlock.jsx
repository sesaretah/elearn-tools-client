import React from "react";


const PanelBlock = (props) => {
    if(props.type === 'chat') {
        return (
            <a className="panel-block is-active is-justify-content-left">
                <div class='rows'>
                .....
                </div>
            </a>
        )
    }
    if(props.type === 'participants') {
        return (
            <a className="panel-block is-active is-justify-content-left">
                <div class='rows'>
                .....
                </div>
            </a>
        )
    }

  }
  export default PanelBlock;