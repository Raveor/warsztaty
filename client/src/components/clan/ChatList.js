import React, {Component} from 'react';
import axios from "axios";
import {applyMiddleware as dispatch} from "redux";
import {GET_ERRORS} from "../../actions/types";
import ChatItem from "./ChatItem";

class ChatList extends Component {

    constructor(props) {
        super(props);
        this.reload = this.reload.bind(this);
        this.state = {
            messages: [],
            loading: true,
            data: {
                message: ""
            },
            errors: {
                message: ""
            }
        };

    }

    componentDidMount() {
        this.interval = setInterval(() => this.reload(), 5000);
        this.reload()
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    reload() {
        axios
            .get('/clan/chat')
            .then((response) => {
                const messages = response.data;
                this.setState({
                    ...this.state,
                    messages,
                    loading: false
                });
            })
            .catch(err => {
                    dispatch({
                        type: GET_ERRORS,
                        payload: err.response
                    })
                }
            );
    }

    validateForm = (errors) => {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    };


    handleChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        if (name === 'message') {
            errors.message =
                value.length < 1
                    ? "Message must not be empty!"
                    : '';
        } else {
        }

        this.setState({
            ...this.state,
            errors,
            ...this.state.data,
            data: {
                [name]: value
            }
        });
    };


    handleSubmit = e => {
        e.preventDefault();
        if (this.validateForm(this.state.errors)) {
            axios
                .post('/clan/chat/add', this.state.data)
                .then(() => {
                    this.setState({
                        ...this.state,
                        message: this.state.data.message
                    });
                    this.reload();
                })
                .catch(errors => {
                    this.setState({
                            ...this.state,
                            errors
                        }
                    );
                });
        }


    };


    render() {
        if (this.state.loading) {
            return (
                <div className="preloader-wrapper big active center loader">
                    <div className="spinner-layer spinner-blue-only">
                        <div className="circle-clipper left">
                            <div className="circle"/>
                        </div>
                        <div className="gap-patch">
                            <div className="circle"/>
                        </div>
                        <div className="circle-clipper right">
                            <div className="circle"/>
                        </div>
                    </div>
                </div>
            )
        }

        let chatList = (this.state.messages && this.state.messages.length > 0) ? this.state.messages.map(clan => (
            <ChatItem
                key={clan.timestamp}
                message={clan}
            />
        )) : (
            <p className="collection-item">There is no clan!</p>
        );

        const {errors} = this.state;


        return (
            <div className="container">
                <div className="collection">
                    <div className="collection-item collection-header">
                        <h3>Chat</h3>
                        {chatList}
                    </div>
                    <div className="collection-item ">
                        <div className="row">
                            {/*<div className="col s3 right">*/}
                            <form className="col s12" onSubmit={this.handleSubmit}>
                                <div className="input-field col s12">
                                    <input id="message" name="message" type="text"
                                           className={errors.message.length > 0 ? 'invalid' : ''}
                                           onChange={this.handleChange}/>
                                    {errors.message.length > 0 &&
                                    <span className="helper-text" data-error={errors.message}/>}
                                    <label htmlFor="name">Send message</label>
                                    <div className="row center">
                                        <button
                                            className="center waves-effect waves-light btn-small"
                                            type="submit"
                                        >
                                            Create!<i className="material-icons right">send</i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}


export default ChatList;
