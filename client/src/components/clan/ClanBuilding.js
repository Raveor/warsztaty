import React, {Component} from 'react';
import PropTypes from "prop-types";

class ClanBuilding extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let building = this.props.building;
        let value = this.props.value;

        let name = building ? building[0].toUpperCase() + building.slice(1) : "something wrong";

        let buttons = this.props.isMoney ?
            <React.Fragment>
                <button
                    className="waves-effect waves-light btn-small"
                    onClick={() => this.props.incrementMoneyFunc(building, value, 100)}
                >
                    +100
                </button>
                <button
                    className="waves-effect waves-light btn-small"
                    onClick={() => this.props.incrementMoneyFunc(building, value, 1000)}
                >
                    +1000
                </button>
            </React.Fragment>
            : this.props.isMemberCommander ? <button
                    className="waves-effect waves-light btn-small"
                    onClick={() => this.props.incrementFunc(building, value)}
                >
                    +1
                </button>
                :
                ""
        ;
        return (
            <li className="collection-item  lighten-5">
                <h5>{name}: {value}</h5>
                {this.props.isMoney ? "" : <h5>Cost: {(value + 1) * 1000}</h5>}
                <div className="right-align">
                    {buttons}
                </div>
            </li>
        );
    }
}

ClanBuilding.propTypes = {};

ClanBuilding.propTypes = {
    building: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    incrementFunc: PropTypes.func.isRequired,
    incrementMoneyFunc: PropTypes.func.isRequired,
    isMoney: PropTypes.bool.isRequired,
    isMemberCommander: PropTypes.bool.isRequired
};

export default ClanBuilding;
