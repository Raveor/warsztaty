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

    loadReports = () => {
        axios.get(`/expeditions/reports`).then(res => {
            const reports = res.data/* .concat(testReports) */; // testing displaying reports when unable to pull them from backend
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

const testReports = [
    {
        _id: 1,
        name: "Test expedition 1",
        time: 12345,
        level: 1,
        whenStarted: new Date(new Date().getTime() - 100000),
        moneyPrize: 1000,
        itemPrize: "test reward 1"
    },
    {
        _id: 2,
        name: "Test expedition 2",
        time: 22345,
        level: 2,
        whenStarted: new Date(new Date().getTime() - 100000),
        itemPrize: "test reward 2"
    },
    {
        _id: 3,
        name: "Test expedition 3",
        time: 32345,
        level: 3,
        whenStarted: new Date(new Date().getTime() - 100000),
        moneyPrize: 2000
    },
    {
        _id: 4,
        name: "Test expedition 4",
        time: 42345,
        level: 4,
        whenStarted: new Date(new Date().getTime() - 100000),
        moneyPrize: 3000,
        itemPrize: "test reward 3"
    }
];

export default ExpeditionReportList;
