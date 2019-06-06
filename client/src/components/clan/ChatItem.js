import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from "moment";

// Moment.globalFormat = 'D MMM YYYY';

class ChatItem extends Component {
    render() {
        let message = this.props.message;

        let dateString = moment.unix(message.timestamp).format("HH:MM DD/MM");
        return (
            <div className="collection-item ">
                <div className="row">
                <span
                    className="title col s6"
                >
                    <h4>{message.message}</h4>
                    <h5>Send by: {message.username}</h5>
                </span>

                    <div className="col s3 right">
                        {dateString}
                    </div>
                </div>
            </div>

        );
    }
}

ChatItem.propTypes = {
    message: PropTypes.object.isRequired,
};

export default ChatItem;
