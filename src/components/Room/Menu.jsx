import React from "react";


const Menu = (props) => {
    function participantTag() {
        var result = []
        if (props.participants) {
            props.participants.map((participant) =>
                result.push(
                    <div class='row is-full'>
                        <div className="tags has-addons  p-1">
                            <span className="tag ">{participant.display}</span>
                            <a className="tag  is-warning">
                                <i className="fas fa-search" aria-hidden="true"></i>
                            </a>
                            <a className="tag is-delete is-danger"></a>
                            <a className="tag is-delete is-dark"></a>
                        </div>
                    </div>
                )
            )
        }
        return (result)
    }
    if (props.room) {
        return (
            <div className="column is-3 is-inline-block-mobile p-0">

                <nav className="panel mt-4 p-2 ml-2">
                    <div className="panel-block">
                        <p className="control has-icons-left">
                            <input className="input" type="text" placeholder="Search" />
                            <span className="icon is-left">
                                <i className="fas fa-search" aria-hidden="true"></i>
                            </span>
                        </p>
                    </div>
                    <p className="panel-tabs">
                        <a className="is-active">Participants</a>
                        <a>Chat</a>
                        <a>Shares</a>
                        <a>Polls</a>
                    </p>
                    <a className="panel-block is-active is-justify-content-left">
                        <div class='rows'>
                            {participantTag()}
                        </div>
                    </a>
                </nav>

            </div>
        )
    } else {
        return (null)
    }
}
export default Menu;