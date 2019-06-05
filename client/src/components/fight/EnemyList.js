import React, { Component } from "react";
import axios from "axios";


class EnemyList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            availableUsers: [],
            enemies: [],
            enemiesMap: new Map(),
            myCharacter: {}
        };
    }

    componentDidMount() {
        this.loadCharacters();
        this.loadMyCharacter();
    }

    loadMyCharacter = () => {
        axios.get('/character')
            .then( result => {
                this.setState( () => {
                    return { myCharacter: result.data.character };
                })
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
                        enemiesMap.set(character.userId, character);

                        enemies.push(
                            <li key={character.userId} className="collection-item avatar">
                                <span className="title">{this.state.availableUsers[character.userId]}</span>
                                <div className="description">Level: {character.level} | Strength: {character.statistics.strength} | Agility: {character.statistics.agility}</div>
                                <button className="waves-effect waves-light btn secondary-content" onClick={() => this.fight(character.userId)}>Fight!</button>
                            </li>
                        );
                    }
                }

                this.setState( () => {
                    return { enemies: enemies, enemiesMap: enemiesMap };
                });
        });
    };

    fight(userId) {
        console.log("fight " + userId);
        let oponent = this.state.enemiesMap.get(userId);
        let my = this.state.myCharacter;

        console.log(my.statistics);
        if(oponent != null) {
            let oponentDamage = oponent.statistics.strength - my.statistics.agility;
            let myDamage = my.statistics.strength - oponent.statistics.agility;

            if (oponentDamage >= myDamage) {
                EnemyList.lost(oponentDamage);
            } else EnemyList.won();
        }
    }

    static lost() {
        alert("You lost!");
    }

    static won(){
        alert("You won!");
    }


    render() {
        return <ul className="collection">{this.state.enemies}</ul>
    }
}

export default EnemyList;
