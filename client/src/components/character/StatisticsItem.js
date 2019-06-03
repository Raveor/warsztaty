import React, {Component} from 'react';
import PropTypes from 'prop-types';

class StatisticsItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let stat = this.props.stat;
        let key = this.props.statName;
        let map = {
            "statPoints": "Left points",
            "health": "Health",
            "strength": "Strength",
            "agility": "Agility",
            "intelligence": "Intelligence",
            "currentHealth": "Current Health",
            "experience": "Experience",
            "level": "Level",
            "money": "Money",
            "experienceRequired": "Required experience"
        };
        let buttons = this.props.isViewOnly ? ("") : (<React.Fragment>
            <button
                className="waves-effect waves-light btn-small"
                onClick={() => this.props.decrementFunc(key, stat)}
            >
                <i className="material-icons">exposure_neg_1</i>
            </button>
            <button
                className="waves-effect waves-light btn-small"
                onClick={() => this.props.incrementFunc(key, stat)}
            >
                <i className="material-icons">exposure_plus_1</i>
            </button>
        </React.Fragment>);
        return (
            <li className="collection-item card-panel grey lighten-5">
                <h5>{map[key]}: {stat}</h5>
                <div className="right-align">
                    {buttons}
                </div>
            </li>
        );
    }
}

StatisticsItem.propTypes = {
    stat: PropTypes.number.isRequired,
    isViewOnly: PropTypes.bool.isRequired,
    statName: PropTypes.string.isRequired,
    decrementFunc: PropTypes.func.isRequired,
    incrementFunc: PropTypes.func.isRequired

};

export default StatisticsItem;
