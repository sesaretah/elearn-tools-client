import React from "react";


const SideBar = (props) => {

  if (props.room) {
    return (
        <aside className="column is-1 aside hero is-fullheight is-hidden-mobile">
        <div>
            <div className="main">
                <a href="#" className="item active"><span class="icon"><i className="fas fa-inbox"></i></span></a>
                <a href="#" className="item"><span className="icon"><i className="fas fa-star"></i></span></a>
                <a href="#" className="item"><span className="icon"><i className="fas fa-envelope-o"></i></span></a>
                <a href="#" className="item"><span className="icon"><i className="fas fa-folder-o"></i></span></a>
            </div>
        </div>
    </aside>
    )} else {
      return (null)
    }
  }
  export default SideBar;