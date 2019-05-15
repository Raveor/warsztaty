import React, { Component } from "react";
import axios from "axios";
import CurrentExpeditionItem from "./CurrentExpeditionItem";
import AvailableExpeditionItem from "./AvailableExpeditionItem";

class ExpeditionSelectList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentExpeditions: [],
            availableExpeditions: [],
            error: null
        };
        this.reloadExpeditions();
    }

    reloadExpeditions = async () => {
        try {
            const response = await axios.get("/expeditions/available");
            // console.log(JSON.stringify(response, null, 2));
            const expeditions = response.data;
            // console.log(JSON.stringify(expeditions, null, 2));
            let currentExpeditions = [];
            let availableExpeditions = [];
            for (const expedition of expeditions) {
                if (expedition.whenStarted) {
                    currentExpeditions.push(expedition);
                } else {
                    availableExpeditions.push(expedition);
                }
            }
            this.setState({
                currentExpeditions,
                availableExpeditions,
                error: null
            });
        } catch (error) {
            console.log(
                "Failed to fetch expedition data:",
                JSON.stringify(error, null, 2)
            );
            this.setState(error);
        }
    };

    goFunc = async expeditionId => {
        await axios.post("/expeditions/go", { expeditionId });
        await this.reloadExpeditions();
    };

    render() {
        // console.log(JSON.stringify(this.state, null, 2));
        if (this.state.error) {
            return (
                <div>
                    Failed to fetch expeditions:{" "}
                    {JSON.stringify(this.state.error, null, 2)}
                </div>
            );
        } else {
            let current =
                this.state.currentExpeditions.length > 0 ? (
                    <ul className="collection">
                        <li className="collection-item collection-header">
                            <h3>Current expeditions</h3>
                        </li>
                        {this.state.currentExpeditions.map(expedition => (
                            <CurrentExpeditionItem
                                key={expedition._id}
                                expedition={expedition}
                                reloadExpeditions={this.reloadExpeditions}
                            />
                        ))}
                    </ul>
                ) : (
                    <div />
                );
            let available =
                this.state.availableExpeditions.length > 0 ? (
                    <ul className="collection">
                        <li className="collection-item collection-header">
                            <h3>Available expeditions</h3>
                        </li>
                        {this.state.availableExpeditions.map(expedition => (
                            <AvailableExpeditionItem
                                key={expedition._id}
                                expedition={expedition}
                                goFunc={this.goFunc}
                            />
                        ))}
                    </ul>
                ) : (
                    <div />
                );
            return (
                <div className="container">
                    {current}
                    {available}
                    <div className="center-align">
                        <button
                            className="waves-effect waves-light btn-large"
                            onClick={() =>
                                this.props.history.push("/expeditions/reports")
                            }
                        >
                            Finished expeditions
                        </button>
                    </div>
                </div>
            );
        }
    }
}

export default ExpeditionSelectList;
