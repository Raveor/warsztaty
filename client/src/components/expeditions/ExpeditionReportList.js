import React, { Component } from "react";
import axios from "axios";
import ExpeditionReportItem from "./ExpeditionReportItem";

class ExpeditionReportList extends Component {
    constructor(props) {
        super(props);
        this.state = { reports: [], expandedReport: null };
    }

    componentDidMount() {
        this.loadReports();
    }

    loadReports = async () => {
        await axios.get(`/expeditions/available`)
        axios.get(`/expeditions/reports`).then(res => {
            const reports = res.data;
            const expandedReport = reports.length > 0 ? reports[0]._id : null;
            this.setState({ reports, expandedReport });
        });
    };

    setExpanded = id => {
        this.setState({ expandedReport: id });
    };

    render() {
        let reports =
            this.state.reports && this.state.reports.length > 0 ? (
                this.state.reports.map(report => (
                    <ExpeditionReportItem
                        key={report._id}
                        report={report}
                        expanded={report._id === this.state.expandedReport}
                        expandFunc={this.setExpanded}
                    />
                ))
            ) : (
                <p className="collection-item">No expedition reports yet!</p>
            );
        return (
            <div className="container" style={{ backgroundColor: "white" }}>
                <div className="collection">
                    <div className="collection-item collection-header">
                        <h3>Expedition reports</h3>
                    </div>
                    {reports}
                </div>
            </div>
        );
    }
}

export default ExpeditionReportList;
