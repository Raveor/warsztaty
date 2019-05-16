import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import "./AvailableExpeditionItem.css"

const AvailableExpeditionItem = props => {
    let expedition = props.expedition;
    return (
        <li
            className="collection-item collection-fit-buttons-properly"
        >
            <div className="valign-wrapper">
                {expedition.name} - Lv. {expedition.level}
            </div>

            <div className="secondary-content">
                {moment.duration(expedition.time).humanize() + "  "}
                <button
                    className="waves-effect waves-light btn-small"
                    onClick={() => props.goFunc(expedition._id)}
                >
                    Go<i className="material-icons right">send</i>
                </button>
            </div>
        </li>
    );
};

AvailableExpeditionItem.propTypes = {
    expedition: PropTypes.object.isRequired,
    goFunc: PropTypes.func.isRequired
};

export default AvailableExpeditionItem;
