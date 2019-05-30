import React, {Component} from 'react';
import axios from "axios";
import {applyMiddleware as dispatch} from "redux";
import {GET_ERRORS} from "../../actions/types";
import StatisticsItem from "./StatisticsItem";

class Character extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true};
        this.decrementFunc = this.decrementFunc.bind(this);
        this.incrementFunc = this.incrementFunc.bind(this);

    }

    componentDidMount() {
        axios
            .get('/character')
            .then((response) => {
                const character = response.data.character;
                const actualStatistics = character.statistics;
                this.setState({
                    character,
                    actualStatistics,
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

    isValidStatChange(key, newStat, newEmptyStatPoint) {
        let actualStatistics = this.state.actualStatistics;
        let statPoint = actualStatistics[key];
        return !(newStat < statPoint || newEmptyStatPoint === -1);

    }

    decrementFunc(key, stat) {
        let statPoint = this.state.character.statistics.statPoints;
        statPoint = statPoint + 1;
        stat = stat - 1;
        if (!this.isValidStatChange(key, stat, statPoint)) {
            return;
        }
        this.setState(prevState => ({
            character: {
                ...prevState.character,
                statistics: {
                    ...prevState.character.statistics,
                    [key]: stat,
                    "statPoints": statPoint
                }
            }
        }));
    }

    incrementFunc(key, stat) {
        let statPoint = this.state.character.statistics.statPoints;
        statPoint = statPoint - 1;
        stat = stat + 1;
        if (!this.isValidStatChange(key, stat, statPoint)) {
            return;
        }
        this.setState(prevState => ({
            character: {
                ...prevState.character,
                statistics: {
                    ...prevState.character.statistics,
                    [key]: stat,
                    "statPoints": statPoint
                }
            }
        }));
    }

    sendNewStatistics() {
        axios
            .put('character', this.state.character)
            .then(() => {
                let actualStatistics = this.state.character.statistics;
                let character = this.state.character;
                this.setState({
                    character,
                    actualStatistics,
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


    render() {

        if (this.state.loading) {
            return (
                <div className="preloader-wrapper big active">
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

        let properAttributes = [
            "currentHealth",
            "experience",
            "level",
            "money",
            "experienceRequired"];

        let statistics = [];

        let charInfo = [];


        Object.entries(this.state.character.statistics).forEach(([key, val]) => {
            statistics.push(<StatisticsItem
                key={key}
                stat={val}
                statName={key}
                decrementFunc={this.decrementFunc}
                incrementFunc={this.incrementFunc}
                isViewOnly={key === "statPoints"}
            />);
        });
        Object.entries(this.state.character).forEach(([key, val]) => {
            if (!properAttributes.includes(key)) return;
            charInfo.push(<StatisticsItem
                key={key}
                stat={val}
                statName={key}
                decrementFunc={this.decrementFunc}
                incrementFunc={this.incrementFunc}
                isViewOnly={true}
            />);
        });


        return (
            <div className="container row" style={{backgroundColor: "white"}}>
                <div className="col s6">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Character info</h3>
                        </li>
                        {charInfo}
                    </ul>
                </div>
                <div className="col s6">
                    <ul className="collection">
                        <li className="collection-item collection-header card-panel grey lighten-5 z-depth-1">
                            <h3>Statistics</h3>
                        </li>
                        {statistics}
                    </ul>
                    <div className="row center">
                        <button
                            className="center waves-effect waves-light btn-large"
                            onClick={() => this.sendNewStatistics()}
                        >
                            Save<i className="material-icons right">send</i>
                        </button>
                    </div>
                </div>

            </div>
        );
    }
}

export default Character;