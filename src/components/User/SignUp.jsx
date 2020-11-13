import React from 'react'
import ModelStore from "../../stores/ModelStore";
import * as MyActions from "../../actions/MyActions";
import { dict } from '../../Dict';

export default class SignUp extends React.Component {

    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.setInstance = this.setInstance.bind(this);

        this.state = {
            nickname: '',
            email: '',
            password: '',
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
        var data = { email: this.state.email, password: this.state.password, nickname: this.state.nickname}
        console.log(data)
        MyActions.setInstance('users/sign_up', data);
    }

    setInstance() {
        var klass = ModelStore.getKlass()
        var user = ModelStore.getIntance();
        if (user && klass === 'SignUp') {
            window.localStorage.setItem('token', user.token);
            this.props.history.push('/');
        }
        console.log(user)
    }

    handleChange(obj) {
        this.setState(obj);
    }



    render() {

        return (
            <React.Fragment>
                <section className="hero is-primary has-background-grey-light is-fullheight">
                    <div className="hero-body">
                        <div className="container">
                            <div className="columns is-centered">
                                <div className="column is-5-tablet is-4-desktop is-3-widescreen">
                                
                                    <div action="" className="box">
                                    <p className='mb-4'>Sign Up</p>
                                    <div className="field">
                                            <label for="" className="label">Nickname</label>
                                            <div className="control has-icons-left">
                                                <input 
                                                    type="email" 
                                                    placeholder="e.g. Bob Smith" 
                                                    className="input" required 
                                                    onInput={(e) => {
                                                        this.handleChange({ nickname: e.target.value })
                                                    }}
                                                />
                                                <span className="icon is-small is-left">
                                                    <i className="fa fa-user"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label for="" className="label">Email</label>
                                            <div className="control has-icons-left">
                                                <input 
                                                    type="email" 
                                                    placeholder="e.g. bobsmith@gmail.com"
                                                    className="input" required 
                                                    onInput={(e) => {
                                                        this.handleChange({ email: e.target.value })
                                                    }}
                                                />
                                                <span className="icon is-small is-left">
                                                    <i className="fa fa-envelope"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label for="" className="label">Password</label>
                                            <div className="control has-icons-left">
                                                <input 
                                                    type="password" 
                                                    placeholder="*******" 
                                                    className="input" required 
                                                    onInput={(e) => {
                                                        this.handleChange({ password: e.target.value })
                                                    }}
                                                />
                                                <span className="icon is-small is-left">
                                                    <i className="fa fa-lock"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <button className="button is-success" onClick={this.submit}>Signup</button>
                                            <a href='/login' className="ml-2 button is-link">Login</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment >
        )
    }
}




