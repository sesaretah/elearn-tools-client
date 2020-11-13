import React from 'react'
import ModelStore from "../../stores/ModelStore";
import * as MyActions from "../../actions/MyActions";
import { dict } from '../../Dict';
import Header from "./Header";

export default class Form extends React.Component {

    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.setInstance = this.setInstance.bind(this);
        this.handleChange = this.handleChange.bind(this);
        
        this.state = {
            token: window.localStorage.getItem('token'),
            title: null,
        }

    }



    componentWillMount() {
        ModelStore.on("set_instance", this.setInstance);

    }

    componentWillUnmount() {
        ModelStore.removeListener("set_instance", this.setInstance);
    }

    componentDidMount() {

    }

    submit() {
        var data = { title: this.state.title }
        MyActions.setInstance('rooms', data, this.state.token);
    }


    handleChange(obj) {
        this.setState(obj);
    }

    setInstance() {
        this.props.history.push('/rooms');
    }


    render() {

        return (
            <React.Fragment>
                <Header />
                <section className="section">
                    <div className="container">
                        <div className="field">
                            <label className="label">Name</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Text input"
                                    onInput={(e) => {
                                        this.handleChange({ title: e.target.value })
                                    }}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Room Type</label>
                            <div className="control">
                                <div className="select">
                                    <select>
                                        <option>Private</option>
                                        <option>Public</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <div className="control">
                                <textarea className="textarea" placeholder="Textarea"></textarea>
                            </div>
                        </div>

                        <div className="field">
                            <div className="control">
                                <label className="checkbox">
                                    <input type="checkbox" />
                                    <span className='ml-2'>I agree to the <a href="#">terms and conditions</a></span>
                                </label>
                            </div>
                        </div>

                        <div class="buttons">
                            <button class="button is-link" onClick={this.submit}>Submit</button>
                            <a href='/rooms' class="button is-light">Cancel</a>
                        </div>

                    </div>
                </section>Î
            </React.Fragment >
        )
    }
}




