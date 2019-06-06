import React, {Component} from 'react';
import axios from "axios";
import {applyMiddleware as dispatch} from "redux";
import {GET_ERRORS} from "../../actions/types";

class Shop extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true};
    }

    componentDidMount() {
        console.log("componentDidMount")
        this.pullData();
    }

    pullData = () => {
        axios.all([
            axios.get('/shop/weapons'),
            axios.get('/shop/outfits'),
            axios.get('/shop/inventory'),
            axios.get('/character'),
        ])
            .then((response) => {
                const weapons = response[0].data;
                const outfits = response[1].data;
                const inventory = response[2].data;
                const character = response[3].data;

                this.setState({
                    weapons: weapons,
                    outfits: outfits,
                    inventory: inventory,
                    character: character,
                    "loading": false
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

    buyWeapon = (weapon) => {
        axios
            .post('/shop/weapons/buy', {weaponId: weapon.weaponId})
            .then(() => {
                this.pullData();
            })
            .catch(err => {
                    alert(err.response.data.message)
                    // dispatch({
                    //     type: GET_ERRORS,
                    //     payload: err.response
                    // })
                }
            );
    }

    buyOutfit = (outfit) => {
        axios
            .post('/shop/outfits/buy', {outfitId: outfit.outfitId})
            .then(() => {
                this.pullData();
            })
            .catch(err => {
                    alert(err.response.data.message)
                    // dispatch({
                    //     type: GET_ERRORS,
                    //     payload: err.response
                    // })
                }
            );
    }

    sellItem = (item) => {
        axios
            .post('/shop/inventory/sell', {itemId: item._id})
            .then(() => {
                this.pullData();
            })
            .catch(err => {
                    alert(err.response.data.message)
                    // dispatch({
                    //     type: GET_ERRORS,
                    //     payload: err.response
                    // })
                }
            );
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="preloader-wrapper big active center">
                    <div className="spinner-layer spinner-blue-only">
                        <div className="circle-clipper left">
                            <div className="circle"></div>
                        </div>
                        <div className="gap-patch">
                            <div className="circle"></div>
                        </div>
                        <div className="circle-clipper right">
                            <div className="circle"></div>
                        </div>
                    </div>
                </div>
            )
        }

        let errors = [];
        if (this.state.error) {
            errors.push(<b><p>{this.state.error}</p></b>)
        }

        let weaponsList = [];

        if (this.state.weapons !== undefined) {

            this.state.weapons
                .sort(function (w1, w2) {
                    return w1.price - w2.price
                })
                .forEach(weapon => {
                    weaponsList
                        .push(
                            <ShopItem item={weapon} action={this.buyWeapon}></ShopItem>
                        );
                });
        }

        let outfitsList = [];

        if (this.state.outfits !== undefined) {
            this.state.outfits
                .sort(function (w1, w2) {
                    return w1.price - w2.price
                })
                .forEach(outfit => {
                    outfitsList
                        .push(
                            <ShopItem item={outfit} action={this.buyOutfit}></ShopItem>
                        );
                });
        }

        let inventoryList = [];

        if (this.state.inventory !== undefined) {
            this.state.inventory
                .sort(function (w1, w2) {
                    return w1.price - w2.price
                })
                .forEach(item => {
                    inventoryList
                        .push(
                            <ShopItem item={item} action={this.sellItem}></ShopItem>
                        );
                });
        }

        return (
            <div className="container row" style={{backgroundColor: "white"}}>
                <div className="col s12">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>You have {this.state.character.character.money} coins</h3>
                        </li>
                    </ul>
                </div>
                <div className="col s6">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Weapons</h3>
                        </li>
                        {weaponsList}
                    </ul>
                </div>
                <div className="col s6">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Outfits</h3>
                        </li>
                        {outfitsList}
                    </ul>
                </div>
                {errors}
                <div className="col s12">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Your equipment</h3>
                        </li>
                        {inventoryList}
                    </ul>
                </div>
            </div>
        );
    }
}


const ShopItem = props => {
    return (
        <li className="collection-item collection-fit-buttons-properly">
            <div>
                <b>{props.item.name}</b>
                <ul>
                    <li>Defence: {props.item.defence}</li>
                    <li>Offence: {props.item.offence}</li>
                    <li>Bonus: {props.item.bonus}</li>
                </ul>
            </div>
            <div className="secondary-content valign-wrapper">
                <button
                    className="center waves-effect waves-light btn-large"
                    onClick={() => props.action(props.item)}
                >
                    {props.item.price}<i className="material-icons right">send</i>
                </button>
            </div>
        </li>
    );
};

export default Shop;