import React, { Component } from "react";
import axios from "axios";
import { applyMiddleware as dispatch } from "redux";
import { GET_ERRORS } from "../../actions/types";

class Inventory extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    componentDidMount = () => {
        axios
            .get("/shop/inventory")
            .then(response => this.setState({ inventory: response.data }))
            .catch(err => {
                dispatch({
                    type: GET_ERRORS,
                    payload: err.response
                });
            });
    };

    render() {
        let errors = [];
        if (this.state.error) {
            errors.push(
                <b>
                    <p>{this.state.error}</p>
                </b>
            );
        }

        let inventoryList = [];

        if (this.state.inventory !== undefined) {
            this.state.inventory
                .sort(function(w1, w2) {
                    return w1.price - w2.price;
                })
                .forEach(item => {
                    inventoryList.push(
                        <li key={item._id} className="collection-item">
                            <b>{item.name}</b>
                            <ul>
                                <li>Defence: {item.defence}</li>
                                <li>Offence: {item.offence}</li>
                                <li>Bonus: {item.bonus}</li>
                            </ul>
                        </li>
                    );
                });
        }
        return (
            <div className="col s12">
                <ul className="collection">
                    <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                        <h3>Inventory</h3>
                        {errors}
                    </li>
                    {inventoryList}
                </ul>
            </div>
        );
    }
}

export default Inventory;
