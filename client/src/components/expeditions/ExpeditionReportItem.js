import React, {Component} from "react";
import PropTypes from "prop-types";

class ExpeditionReportItem extends Component {
    render() {
        let report = this.props.report;
        let endDate = new Date(
            new Date(report.whenStarted).getTime() + report.time
        ).toLocaleString();
        let content = this.props.expanded ? (
            <div className="collection-item">
                <span
                    className="title"
                    onClick={() => this.props.expandFunc(null)}
                >
                    <h4>{report.name}</h4>
                </span>
                <p>Level {report.level}</p>
                <p>
                    Loot: {report.moneyPrize || 0} gold<br />
                    Experience: {report.experience || 0} XP<br />
                    {report.health ? `Health lost: ${report.health * 100}%` : ""}<br />
                    <i className="grey-text">{endDate}</i>
                </p>
            </div>
        ) : (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a
                className="collection-item"
                onClick={() => this.props.expandFunc(report._id)}
            >
                <div>
                    {report.name}
                    <div className="secondary-content">{endDate}</div>
                </div>
            </a>
        );
        return content;
    }
}

ExpeditionReportItem.propTypes = {
    expanded: PropTypes.bool,
    report: PropTypes.object.isRequired,
    expandFunc: PropTypes.func.isRequired
};

export default ExpeditionReportItem;
