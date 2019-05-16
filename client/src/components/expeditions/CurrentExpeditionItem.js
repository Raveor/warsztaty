import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

const CurrentExpeditionItem = props => {
    let endTime = moment(props.expedition.whenStarted).add(
        props.expedition.time,
        "milliseconds"
    );
    let expedition = props.expedition;
    return (
        <li className="collection-item">
            <div>
                {expedition.name} - Lv. {expedition.level}
                <div className="secondary-content">
                    <CurrentExpeditionTimer
                        endTime={endTime}
                        reloadExpeditions={props.reloadExpeditions}
                    />
                </div>
            </div>
        </li>
    );
};

CurrentExpeditionItem.propTypes = {
    expedition: PropTypes.object.isRequired,
    reloadExpeditions: PropTypes.func.isRequired
};

class CurrentExpeditionTimer extends Component {
    constructor(props) {
        super(props);
        const endString = this.props.endTime.toNow(true);
        const endTitle = this.props.endTime.format(
            "dddd, MMMM Do YYYY, h:mm:ss a"
        );
        this.state = { endTime: this.props.endTime, endString, endTitle };
    }

    updateTime = () => {
        const endString = this.state.endTime.toNow(true);
        if (moment().isBefore(this.state.endTime)) {
            this.setState({ endString });
        } else {
            this.props.reloadExpeditions();
        }
    };

    timer;

    componentDidMount() {
        this.timer = setInterval(this.updateTime, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return (
            <div title={this.state.endTitle}>
                {this.state.endString} remaining
            </div>
        );
    }
}

CurrentExpeditionTimer.propTypes = {
    endTime: PropTypes.object.isRequired,
    reloadExpeditions: PropTypes.func.isRequired
};

export default CurrentExpeditionItem;
