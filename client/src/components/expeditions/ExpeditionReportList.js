import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import ExpeditionReportItem from "./ExpeditionReportItem";

class ExpeditionReportList extends Component {
    componentDidMount() {
        axios.get(`/expeditions/reports`).then(res => {
            const reports = res.data;
            this.setState({ reports });
        });
    }

    render() {
        return (
            <div>
                <ul>
                    {this.state.reports.map((report, index) =>
                        <ExpeditionReportItem report={report}></ExpeditionReportItem>
                    )}
                </ul>
            </div>
        );
    }
}

ExpeditionReportList.propTypes = {};

export default ExpeditionReportList;
