import React, {Component} from "react";
import axios from "axios";
import UserItem from "./UserItem";

class AdminPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.setAdmin = this.setAdmin.bind(this);
        this.setActive = this.setActive.bind(this);
        this.setContact = this.setContact.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    componentDidMount() {
        this.loadReports();
    }

    loadReports() {
        axios.get("/admin/users")
            .then(response => {
                const users = response.data;
                const expand = this.state.expand ? this.state.expand : users.length > 0 ? users[0].id : null;
                this.setState({
                    ...this.state,
                    users,
                    expand
                });
            })
            .catch(error => {
                this.setState({
                        error
                    }
                );
                console.log(error);
            });
    };

    setExpanded = id => {
        this.setState({expand: id});
    };

    setAdmin(_id, admin) {
        axios.put("/admin/users/admin", {_id: _id, setAdmin: admin})
            .then(response => {
                this.loadReports();
            })
            .catch(error => {
                this.setState({
                        ...this.state,
                        error
                    }
                );
                console.log(error);
            });

    };

    setActive(_id, active) {
        axios.put("/admin/users/active", {_id: _id, setActive: active})
            .then(response => {
                this.loadReports();
            })
            .catch(error => {
                this.setState({
                        ...this.state,
                        error
                    }
                );
                console.log(error);
            });

    };

    setContact(_id, contact) {
        axios.put("/admin/users/contact", {_id: _id, setContact: contact})
            .then(response => {
                this.loadReports();
            })
            .catch(error => {
                this.setState({
                        ...this.state,
                        error
                    }
                );
                console.log(error);
            });

    };

    deleteUser(_id) {
        axios.delete("/admin/users/delete", {data: {_id: _id}})
            .then(response => {
                this.loadReports();
            })
            .catch(error => {
                this.setState({
                        ...this.state,
                        error
                    }
                );
                console.log(error);
            });
    };

    render() {
        let products =
            this.state.users && this.state.users.length > 0 ? (
                this.state.users.map(user => (
                    <UserItem
                        key={user._id}
                        user={user}
                        expanded={user._id === this.state.expand}
                        expandFunc={this.setExpanded}
                        setAdmin={this.setAdmin}
                        setActive={this.setActive}
                        setContact={this.setContact}
                        deleteUser={this.deleteUser}
                    />
                ))
            ) : (
                <p className="collection-item">There is no users!</p>
            );
        return (
            <div className="container" style={{backgroundColor: "white"}}>
                <ul className="collection container-row">
                    <div className="collection-item collection-header">
                        <h3>Users</h3>
                    </div>
                    {products}
                </ul>
            </div>
        );
    }
}

export default AdminPanel;
