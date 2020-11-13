import React from "react";
import { useHistory } from "react-router-dom";


const Header = (props) => {
    let history = useHistory();
    function signOut(){
        console.log('Signing Out ...')
        window.localStorage.setItem('token', '');
        history.push('/');
    }
    function loginButton(){
        if (!props.token || props.token.length < 5){
            return( <p class="level-item"><a href='/login' class="button is-primary">Login</a></p>)
        } else {
            return( <p class="level-item"><a onClick={() => signOut()} class="button is-light">Sign Out</a></p>)
        }
    }
    return (
        <nav id="navbar" class="bd-navbar navbar has-shadow is-spaced">
        <div class="container">
            <div class="navbar-brand">
                <a class="navbar-item" href="https://bulma.io">
                    <img src="https://bulma.io/images/bulma-logo.png" alt="Bulma: Free, open source, and modern CSS framework based on Flexbox" width="112" height="28" />
                </a>
            </div>
            <div  class="navbar-menu">
                <div class="navbar-start">
                <a href='/rooms' class="navbar-item">
                        <i className="fas fa-home mr-1"></i>
                        <span>Home</span>
                    </a>
                    <a href='/rooms' class="navbar-item">
                        <i className="fas fa-door-open mr-1"></i>
                        <span>Rooms</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="level-right">
           {loginButton()}
        </div>
    </nav>
    )
  }
  export default Header;