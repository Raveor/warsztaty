import React, {Component} from 'react';
import PropTypes from 'prop-types';

class ClanMemberItem extends Component {
    render() {
        let member = this.props.member;
        let isUserCommander = this.props.isUserCommander;
        let isMemberCommander = this.props.isMemberCommander;
        let deleteMember;
        let changeCommander;
        if (isUserCommander) {
            deleteMember = member.userId._id === this.props.userId ? "" : <button
                className="waves-effect waves-light btn-small red"
                onClick={() => this.props.deleteMember(member.userId.username)}
            >
                Dissmiss<i className="material-icons right">close</i>
            </button>;

            changeCommander = this.props.isMemberCommander ? "" :
                <button
                    className="waves-effect waves-light btn-small"
                    onClick={() => this.props.setCommander(member.userId.username)}
                >
                    Promote<i className="material-icons right">check</i>
                </button>;


        }

        return this.props.expanded ? (
            <div className="collection-item ">
                <div className="row">
                <span
                    className="title col s6"
                >
                    <h4>{member.userId.username}</h4>
                    <h5>Level: {member.level}</h5>
                    {isMemberCommander ? <h5>Commander</h5> : ""}
                </span>

                    <div className="col s3 right">
                        {deleteMember}
                        {changeCommander}
                    </div>
                </div>

                {/*<i className="grey-text">{category.membername}</i>*/}
            </div>
        ) : (
            <a
                className="collection-item"
                onClick={() => this.props.expandFunc(member._id)}
            >
                <div>
                    {member.userId.username}
                    <div className="secondary-content mr-10">
                        {isMemberCommander ? "Commander " : ""}
                        Level: {member.level}
                    </div>
                </div>
            </a>
        );
    }
}

ClanMemberItem.propTypes = {
    member: PropTypes.object.isRequired,
    isUserCommander: PropTypes.bool.isRequired,
    isMemberCommander: PropTypes.bool.isRequired,
    expandFunc: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    deleteMember: PropTypes.func.isRequired,
};

export default ClanMemberItem;