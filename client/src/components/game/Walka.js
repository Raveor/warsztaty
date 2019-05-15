import React, {Component} from "react";
import axios from "axios";

class Walka extends Component {
    constructor() {
        super();
        this.state = {
            opponents: [],
        };
    }
    componentDidMount() {
        axios.get("/users/all").then(results => {
            let oponents = results.data.map((user) => {
                    return (
                        <li className="collection-item">
                            <div>{user.username}<a href="#!" className="secondary-content"><i className="material-icons">send</i></a>
                            </div>
                        </li>
                )
            });

            this.setState({opponents: oponents});
        }).then( () => {
            this.filterUsersOnExpedition();
        });
    }

    filterUsersOnExpedition(){
        for(let user in this.state.opponents){
            axios.get("/expeditions/current", {
                userId: user._id
            }).then( results => {
                if(results.data.length > 0){
                    // elminate taken user
                }
            });
        }
    }

    render() {
        return (
            <div className="container">
                <ul className="collection with-header">
                    <li className="collection-header"><h4>Przeciwnicy:</h4></li>
                    {this.state.opponents}
                </ul>
            </div>
        )
    }
}

export default Walka;
