import React, { useState } from "react";


const Menu = (props) => {
    const [panel, setPanel] = useState('Welcome to this room !');
    const [chats, setChats] = useState([]);

    React.useEffect(() => {
        chatsHook(props.chats);
    }, [props.chats])

    function chatsHook(c){
        console.log(c)
        setChats(c);
        chatsBody();
        panelBlocks('chat');
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            props.sendChat(event.target.value)
            console.log('do validate', event.target.value)
        }
    }

    function participantTag() {
        var result = []
        if (props.participants) {
            props.participants.map((participant) =>
                result.push(
                    <div class='row is-full'>
                        <div className="tags has-addons  p-1">
                            <span className="tag w-150">{participant.display}</span>
                            <a className="tag  is-warning">
                                <i className="fas fa-search" aria-hidden="true"></i>
                            </a>
                            <a className="tag  is-info">
                                <i className="fas fa-check" aria-hidden="true"></i>
                            </a>
                            <a className="tag  is-dark">
                                <i className="fas fa-times" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                )
            )
        }
        return (result)
    }

    function chatsBody() {
        console.log('chats', chats)
        console.log('props.chats', props.chats)
        var result = []
        if (chats) {
            chats.map((chat) => {
                result.push(
                    <article class="media">

                        <div class="media-content">
                            <div class="content">
                                <p>
                                    <strong>{chat.display}</strong> <small>31m</small>
                                    <br />
                                    {chat.body}
                                </p>
                            </div>
                        </div>
                    </article>
                )
            })
        }
        console.log(result)
        return result
    }

    function panelBlocks(p) {
        var result = []
        switch (p) {
            case 'chat':
                result.push(
                    <div id='panel-block' className="panel-block is-justify-content-left is-fullwidth ai-b">
                        <div className="control is-expanded has-icons-left ">

                            <input className="input mb-4" type="text" placeholder="Type here!" onKeyDown={handleKeyDown} />
                            <span className="icon is-left mb-4">
                                <i className="fas fa-comment" aria-hidden="true"></i>
                            </span>
                            {chatsBody}
                        </div>
                    </div >)
                break;
            case 'shares':
                // code block
                break;
            case 'polls':
                // code block
                break;
            default:
                result.push(
                    <a id='panel-block' className="panel-block is-active is-justify-content-left">
                        <div class='rows'>
                            {participantTag()}
                        </div>
                    </a>)
        }
        return (result)
    }
    if (props.room) {
        return (
            <div className="column is-3 is-inline-block-mobile p-0">

                <nav className="panel mt-4 p-2 ml-2 h-100">
                    <div className="panel-block">
                        <p className="control has-icons-left">
                            <input className="input" type="text" placeholder="Search" />
                            <span className="icon is-left">
                                <i className="fas fa-search" aria-hidden="true"></i>
                            </span>
                        </p>
                    </div>
                    <p className="panel-tabs">
                        <a className="is-active">!</a>
                        <a onClick={() => setPanel(panelBlocks('participants'))}>Participants</a>
                        <a onClick={() => setPanel(panelBlocks('chat'))}>Chat</a>
                        <a>Shares</a>
                        <a>Polls</a>
                    </p>

                    {panel}
                </nav>

            </div>
        )
    } else {
        return (null)
    }
}
export default Menu;