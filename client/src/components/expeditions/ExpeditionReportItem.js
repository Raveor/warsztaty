import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ExpeditionReportItem extends Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
            <div>
                {JSON.stringify(this.props.report)}
            </div>
        );
    }
}

ExpeditionReportItem.propTypes = {
    expanded: PropTypes.bool,
    report: PropTypes.object.isRequired
};

export default ExpeditionReportItem;