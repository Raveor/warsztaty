import React, {Component} from "react";
import PropTypes from "prop-types";

class UserItem extends Component {
    constructor(props) {
        super(props);
        this.state = {role: {}};
    }

    /*{
        "adminFlag": false,
        "contactFlag": true,
        "activeFlag": true,
        "_id": "5cbf786a02dd015c0c431ffd",
        "username": "brennus",
        "email": "asdad@sfdsf.asfasd",
        "password": "$2a$08$EF9keKYNfvgxUv2LJJkMNe4huJlliZA2fhdrnoHiQ8Nq/wctqf.ay",
        "__v": 0
    },*/

    render() {
        let user = this.props.user;
        let admin = user.adminFlag ? "Yes" : "No";
        let active = user.activeFlag ? "Yes" : "No";
        let contact = user.contactFlag ? "Yes" : "No";

        let adminButton = user.adminFlag ? <button
                className="waves-effect waves-light btn-small red"
                onClick={() => this.props.setAdmin(user._id, !user.adminFlag)}
            >
                Admin<i className="material-icons right">close</i>
            </button> :
            <button
                className="waves-effect waves-light btn-small"
                onClick={() => this.props.setAdmin(user._id, !user.adminFlag)}
            >
                Admin<i className="material-icons right">check</i>
            </button>
        ;
        let activeButton = user.activeFlag ? <button
                className="waves-effect waves-light btn-small red"
                onClick={() => this.props.setActive(user._id, !user.activeFlag)}
            >
                Active<i className="material-icons right">close</i>
            </button> :
            <button
                className="waves-effect waves-light btn-small"
                onClick={() => this.props.setActive(user._id, !user.activeFlag)}
            >
                Active<i className="material-icons right">check</i>
            </button>
        ;
        let contactButton = user.contactFlag ? <button
                className="waves-effect waves-light btn-small red"
                onClick={() => this.props.setContact(user._id, !user.contactFlag)}
            >
                Contact<i className="material-icons right">close</i>
            </button> :
            <button
                className="waves-effect waves-light btn-small"
                onClick={() => this.props.setContact(user._id, !user.contactFlag)}
            >
                Contact<i className="material-icons right">check</i>
            </button>
        ;

        let deleteButton = <button
            className="waves-effect waves-light btn-small red"
            onClick={() => this.props.deleteUser(user._id)}
        >
            Delete<i className="material-icons right">close</i>
        </button>;


        return this.props.expanded ? (
            <li className="collection-item">
                <div className="row">
                <span
                    className="title col s6"
                >
                    <h4>{user.username}</h4>
                    <h5>{user.email}</h5>
                    <p>{user._id}</p>
                    <p>
                        Admin: {admin}
                    </p>
                    <p>Active: {active}</p>
                    <p>Can write messages: {contact}</p>
                                    </span>

                    <div className="col s3 right offset-m2">
                        {adminButton}
                        {activeButton}
                        {contactButton}
                        {deleteButton}

                    </div>
                </div>

                {/*<i className="grey-text">{category.username}</i>*/}
            </li>
        ) : (
            <a
                className="collection-item"
                onClick={() => this.props.expandFunc(user._id)}
            >
                <li>
                    {user.username}
                    <div className="secondary-content mr-10">
                        {user.email}
                    </div>
                </li>
            </a>
        );
    };
}

UserItem.propTypes = {
    expanded: PropTypes.bool,
    user: PropTypes.object.isRequired,
    setAdmin: PropTypes.func.isRequired,
    setActive: PropTypes.func.isRequired,
    setContact: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    expandFunc: PropTypes.func.isRequired
};

export default UserItem;