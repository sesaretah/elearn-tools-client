import React from 'react'
import ModelStore from "../../stores/ModelStore";
import * as MyActions from "../../actions/MyActions";
import { dict } from '../../Dict';
import Header from "./Header";

export default class Room extends React.Component {

    constructor(props) {
        super(props);
        this.getList = this.getList.bind(this);
        this.roomCards = this.roomCards.bind(this);

        this.state = {
            token: window.localStorage.getItem('token'),
            rooms: null,
        }

    }



    componentWillMount() {
        ModelStore.on("got_list", this.getList);
    }

    componentWillUnmount() {
        ModelStore.removeListener("got_list", this.getList);
    }

    componentDidMount() {
        if (this.state.token && this.state.token.length > 5) {
            MyActions.getList('rooms', this.state.page, {}, this.state.token);
        }
    }

    getList() {
        var rooms = ModelStore.getList()
        var klass = ModelStore.getKlass()
        if (rooms && klass === 'Room') {
            this.setState({
                rooms: rooms,
            });
        }
        console.log(rooms)
    }




    roomCards() {
        var result = []
        if (this.state.rooms) {
            this.state.rooms.map((room) =>
                result.push(
                    <div class="column is-3">
                        <div class="card has-background-white-ter">
                            <header class="card-header">
                                <p class="card-header-title">
                                    {room.title}
                                </p>
                            </header>
                            <div class="card-content">
                                <div class="content">
                                    {room.description ? room.description : 'The creator did not provide a desctiption. You can join to find out more about this room.'}
                                </div>
                            </div>
                            <footer class="card-footer">
                                <a href={"/rooms/" + room.id} class="card-footer-item">Join</a>
                            </footer>
                        </div>
                    </div>
                )
            )

        }
        return (result)
    }



    render() {
        const { token } = this.state;
        return (
            <React.Fragment>

                <Header token={token} />
                <section className="section">
                    <div className="container">
                        <div class="columns is-multiline">
                            <div class="column is-3">
                                <div class="card has-background-info-light">
                                    <header class="card-header">
                                        <p class="card-header-title">
                                            Create New Room
                        </p>
                                    </header>
                                    <div class="card-content">
                                        <div class="content">
                                            You can create rooms. Participants in a room can share their videos, voices and ideas with each other.
                                        </div>
                                    </div>
                                    <footer class="card-footer">
                                        <a href="/rooms/new" class="card-footer-item">Create</a>
                                    </footer>
                                </div>
                            </div>
                            {this.roomCards()}

                        </div>
                    </div>
                </section>




            </React.Fragment >
        )
    }
}




