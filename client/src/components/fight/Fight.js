import React, {Component} from "react";
import axios from "axios";
import {applyMiddleware as dispatch} from "redux";
import {GET_ERRORS} from "../../actions/types";


class Fight extends Component {
    constructor(props) {
        super(props);
        this.state = {
            availableUsers: [],
            enemies: [],
            enemiesMap: new Map(),
            myCharacter: {},
            loading: true,
            myDamage: 0,
            myDefense: 0,
            bonus: 0
        };
    }

    componentDidMount() {
        this.loadCharacters();
        this.loadMyCharacter();
    }

    loadMyCharacter(){
        this.setState( { loading: true });

        axios.get('/character')
            .then( result => {
                console.log(result.data.character.currentHealth);
                this.setState( () => {
                    return { myCharacter: result.data.character, myDamage: result.data.character.statistics.strength, myDefense: result.data.character.statistics.agility };
                });

                axios.get('/shop/inventory')
                    .then(response => this.setState({ inventory: response.data }))
                    .then( () => {
                        if (this.state.inventory !== undefined) {
                            this.state.inventory
                                .sort(function(w1, w2) {
                                    return w1.price - w2.price;
                                })
                                .forEach(item => {
                                    this.setState({ myDamage: this.state.myDamage + item.offence, myDefense: this.state.myDefense + item.defence, bonus: this.state.bonus + item.bonus });
                                });
                        }

                        this.setState( { loading: false });
                    })
                    .catch(err => {
                        dispatch({
                            type: GET_ERRORS,
                            payload: err.response
                        });
                    });
            });
    };

    loadCharacters = async() => {
        let ids = [];
        await axios.get('/users/available')
            .then( result => {
                for(let user in result.data){
                    ids.push(String(user));
                }

                this.setState( () => {
                    return { availableUsers: result.data };
                });

            });

        axios.get('/character/others')
            .then( res => {
                let enemies = [];
                let enemiesMap = new Map();
                for(let i = 0; i < res.data.character.length; i++){
                    let character = res.data.character[i];
                    if(ids.includes(character.userId)){

                        let oponentDamage = character.statistics.strength;
                        let oponentDefense = character.statistics.agility;

                        if(character.level + 2 >= this.state.myCharacter.level && (oponentDamage !== this.state.myDefense || oponentDefense !==this.state.myDamage)){
                            enemiesMap.set(character.userId, character);

                            enemies.push(
                                <li key={character.userId} className="collection-item avatar">
                                    <span className="title"><b>{this.state.availableUsers[character.userId]}</b></span>
                                    <div className="description">Offense: {oponentDamage} | Defense: {oponentDefense}</div>
                                    <button className="waves-effect waves-light btn secondary-content" onClick={() => this.fight(character.userId)}>Fight!</button>
                                </li>
                            );
                        }
                    }
                }

                this.setState( () => {
                    return {enemies: enemies, enemiesMap: enemiesMap, loading: false};
                });
        });
    };

    fight(userId) {
        // console.log("fight " + userId);
        let oponent = this.state.enemiesMap.get(userId);
        let my = this.state.myCharacter;

        if(my.currentHealth <= 0){
            alert("You have too low health! Wait a moment!");
            return;
        }

        // console.log(my.statistics);
        if(oponent != null) {
            let oponentDamage = oponent.statistics.strength - my.statistics.agility;
            let myDamage = my.statistics.strength - oponent.statistics.agility;

            if (oponentDamage >= myDamage) {
                let hpLoss = Math.floor(oponentDamage * 0.3);
                let expGain = myDamage * (this.state.bonus + 0.1);

                my.currentHealth -= hpLoss;
                my.experience += expGain;
                this.lost(my, hpLoss, expGain);
            } else {
                let hpLoss = Math.floor(oponentDamage * 0.1);
                let expGain = Math.ceil(oponentDamage * (this.state.bonus + 0.5));
                let moneyGain = Math.ceil(oponentDamage * (this.state.bonus + 1) * 0.1);

                my.currentHealth -= hpLoss;
                my.experience += expGain;
                my.money += moneyGain;
                this.won(my, hpLoss, expGain, moneyGain);
            }
        }
    }

    lost(my, damage, exp) {
        alert("You lost " + damage + "hp! \nBut gained " + exp + " exp!");

        axios.put('/character',  my);
        this.loadMyCharacter();
    }

    won(my, damage, exp, money){
        alert("You won! Exp gained: " + exp + " Money gained: " + money + "!\n Damage taken: " + damage + "!");

        axios.put('/character', my );
        this.loadMyCharacter();
    }


    render() {
        let myStats = (
            <div>
                <h4>My Stats</h4>
                <table>
                    <thead>
                    <tr>
                        <th>Health</th>
                        <th>Offense</th>
                        <th>Defense</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td>{this.state.myCharacter.currentHealth}</td>
                        <td>{this.state.myDamage}</td>
                        <td>{this.state.myDefense}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );

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

        return (
            <div className="container row" style={{backgroundColor: "white",  fontFamily: 'monospace' }}>
                <div className="col s3">
                    {myStats}
                </div>
                <div className="col s9">
                    <ul className="collection">{this.state.enemies}</ul>
                </div>
            </div>
        );
    }
}

export default Fight;