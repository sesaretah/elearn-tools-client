import React from 'react'
import ModelStore from "../../stores/ModelStore";
import * as MyActions from "../../actions/MyActions";
import { dict } from '../../Dict';
import axios, { put } from 'axios';
import Moment from 'react-moment';
import $ from 'jquery';
import { conf } from '../../conf';

export default class Menuu extends React.Component {

    constructor(props) {
        super(props);
        this.participantTag = this.participantTag.bind(this);
        this.chatsBody = this.chatsBody.bind(this);
        this.panelBlocks = this.panelBlocks.bind(this);
        this.upload = this.upload.bind(this);
        this.getList = this.getList.bind(this);
        this.sharesBody = this.sharesBody.bind(this);

        this.state = {
            token: window.localStorage.getItem('token'),
            chats: [],
            panel: [],
            file: null,
            progress: 0,
            progressShow: false,
            uploads: null,
            room: null,
            uploaded: false,
            currentBlock: 'participants',
        }

    }



    componentWillMount() {
        ModelStore.on("got_list", this.getList);
    }

    componentWillUnmount() {
        ModelStore.removeListener("got_list", this.getList);
    }

    componentDidMount() {

    }

    getList() {
        var uploads = ModelStore.getList()
        var klass = ModelStore.getKlass()
        if (uploads && klass === 'Upload') {
            this.setState({
                uploads: uploads,
            }, () => this.panelBlocks('shares'));
        }
        console.log('uploads', uploads)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.chats !== this.props.chats && this.state.currentBlock === 'chat') {
            this.panelBlocks('chat')
        }
        if (prevProps.participants !== this.props.participants) {
            this.panelBlocks('participants')
        }
        if (prevProps.uploads !== this.props.uploads) {
            this.panelBlocks('shares')
        }
        if (prevProps.room !== this.props.room) {
            console.log('room id:', this.props.roomId)
            this.setState({ room: this.props.room })
            MyActions.getList('uploads', this.state.page, { room_id: this.props.room.id }, this.state.token);
        }
    }

    upload(file) {
        var self = this;
        console.log(file)
        self.setState({ progressShow: true}, () => self.panelBlocks('shares'))
        const config = {
            onUploadProgress: function (progressEvent) {
                var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                console.log(percentCompleted)
                self.setState({ progress: percentCompleted }, () => self.panelBlocks('shares'))
            
            },
            headers: {'Content-Type': 'application/json', 'Authorization': "bearer " + self.state.token } 
        }

        let data = new FormData()
        data.append('upload[attached_document]', file)
        data.append('upload[room_id]', self.state.room.id)

        axios.post(conf.server + '/uploads', data, config)
            .then(res =>
                    {
                        self.setState({ progressShow: false},
                        () => self.panelBlocks('shares'));
                        MyActions.getList('uploads', this.state.page, { room_id: this.props.room.id }, this.state.token);
                    })
            .catch(err => self.setState({ progressShow: false }, () => self.panelBlocks('shares')))
    }

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            this.props.sendChat(event.target.value)
            $("#chat-input").val('');
            console.log('do validate', event.target.value)
        }
    }


    participantTag() {
        var result = []
        if (this.props.participants) {
            this.props.participants.map((participant) =>
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

    chatsBody() {
        var result = []
        if (this.props.chats) {
            this.props.chats.map((chat) => {
                console.log(chat)
                result.push(
                    <article class="media">

                        <div class="media-content">
                            <div class="content">
                                <p>
                                    <strong>{chat.display}</strong> <small> <Moment fromNow ago>{chat.time}</Moment></small>
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

    sharesBody() {
        var result = []
        if (this.state.uploads) {
            this.state.uploads.map((upload) => {
                result.push(
                    <article className="media">

                        <div className="media-content">
                            <div className="content">
                                <p>
                                    <strong>{upload.uploader}</strong> <small> <Moment fromNow ago>{upload.created_at}</Moment></small>
                                    <br />
                                    <a target='_blank' href={upload.link} className='fs-10'><i className="fa fa-download" aria-hidden="true"></i> Download!</a>
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

    panelBlocks(p) {
        this.setState({currentBlock: p})
        var result = []
        switch (p) {
            case 'chat':
                result.push(
                    <div className="w-100">
                        <div className="control is-expanded has-icons-left ">

                            <input id='chat-input' className="input mb-4" type="text" placeholder="Type here!" onKeyDown={this.handleKeyDown} />
                            <span className="icon is-left mb-4">
                                <i className="fas fa-comment" aria-hidden="true"></i>
                            </span>
                            {this.chatsBody()}
                        </div>
                    </div >)
                break;
            case 'shares':
                result.push(
                    <div className="w-100 d-block">
                        <div className='w-100 mt-4'>
                            <div className="field ">
                                <div className="file is-small">
                                    <label className="file-label mrl-auto">
                                        <input className="file-input" type="file" name="resume" onInput={(e) => this.upload(e.target.files[0])} />
                                        <span className="file-cta">
                                            <span className="file-icon">
                                                <i className="fas fa-upload"></i>
                                            </span>
                                            <span className="file-label">Choose a file to upload !</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='row mt-2'>
                            <progress className={this.state.progressShow ? 'progress is-primary ' : 'progress is-primary is-hidden'} value={this.state.progress} max="100">{this.state.progress}</progress>
                        </div>
                        {this.sharesBody()}

                    </div>
                )
                break;
            case 'polls':
                // code block
                break;
            default:
                result.push(
                    <div className="w-100">
                        <div class='rows'>
                            {this.participantTag()}
                        </div>
                    </div>)
        }
        console.log(result)
        this.setState({ panel: result })
    }




    render() {
        const { token } = this.state;
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
                        <a onClick={() => this.panelBlocks('participants')}>
                            Participants
                            <span className="badge bg-red"></span>
                        </a>
                        <a onClick={() => this.panelBlocks('chat')}>Chat</a>
                        <a onClick={() => this.panelBlocks('shares')}>Shares</a>
                        <a>Polls</a>
                    </p>
                    <div id='panel-block' className="panel-block is-justify-content-left is-fullwidth ai-b">
                        {this.state.panel}
                    </div>
                </nav>

            </div>
        )
    }
}




