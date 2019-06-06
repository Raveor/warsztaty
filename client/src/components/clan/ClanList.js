import React, {Component} from 'react';
import axios from "axios";
import {applyMiddleware as dispatch} from "redux";
import {GET_ERRORS} from "../../actions/types";
import ClanItem from "./ClanItem";

class ClanList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            clans: [],
            expand: null,
            loading: true

        };
    }

    componentDidMount() {
        axios
            .get('/clan/')
            .then((response) => {
                const clans = response.data;
                this.setState({
                    clans,
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

    setExpanded = id => {
        this.setState({expand: id});
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

        let clanList = (this.state.clans && this.state.clans.length > 0) ? this.state.clans.map(clan => (
            <ClanItem
                key={clan._id}
                clan={clan}
                expanded={clan._id === this.state.expand}
                expandFunc={this.setExpanded}
            />
        )) : (
            <p className="collection-item">There is no clan!</p>
        );

        return (
            <div className="container">
                <div className="collection">
                    <div className="collection-item collection-header">
                        <h3>Clans</h3>
                        {clanList}
                    </div>
                </div>
            </div>
        );
    }
}


export default ClanList;
