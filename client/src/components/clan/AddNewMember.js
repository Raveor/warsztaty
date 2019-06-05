import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from "axios";

class AddNewMember extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                name: ""
            },
            errors: {
                name: ""
            }
        };

    }

    validateForm = (errors) => {
        let valid = true;
        Object.values(errors).forEach(
            (val) => val.length > 0 && (valid = false)
        );
        return valid;
    };


    handleChange = e => {
        e.preventDefault();
        const {name, value} = e.target;
        let errors = this.state.errors;

        if (name === 'name') {
            errors.name =
                value.length < 2
                    ? "Clan name must be 2 characters long!"
                    : '';
        } else {
        }

        this.setState({
            ...this.state,
            errors,
            ...this.state.data,
            data: {
                [name]: value
            }
        });
    };


    handleSubmit = e => {
        e.preventDefault();
        if (this.validateForm(this.state.errors)) {
            axios.post("/clan/attach", {username: this.state.data.name})
                .then(() => {
                    this.setState({
                        ...this.state,
                        data: {
                            name: ""
                        },
                        errors: {
                            name: ""
                        }
                    });
                    this.props.reload();
                })
                .catch(errors => {
                        if (errors.response.data) {
                            this.setState({
                                ...this.state,
                                errors: {
                                    name: errors.response.data.message
                                }
                            });
                        }
                    }
                )

        }


    };

    render() {
        const {errors} = this.state;

        return this.props.expanded ? (
            <div className="collection-item ">
                <div className="row">
                    {/*<div className="col s3 right">*/}
                    <form onSubmit={this.handleSubmit}>
                        <div className="input-field">
                            <input id="name" name="name" type="text"
                                   className={errors.name.length > 0 ? 'invalid' : ''}
                                   onChange={this.handleChange}/>
                            {errors.name.length > 0 &&
                            <span className="helper-text" data-error={errors.name}/>}
                            <label htmlFor="name">Username to add</label>
                            <div className="row center">
                                <button
                                    className="center waves-effect waves-light btn-small"
                                    type="submit"
                                >
                                    Add<i className="material-icons right">send</i>
                                </button>
                            </div>
                        </div>
                    </form>
                    {/*</div>*/}
                </div>
            </div>
        ) : (
            <a
                className="collection-item"
                onClick={() => this.props.expandFunc(1)}
            >
                <div>
                    Add new member!
                </div>
            </a>
        );
    }
}

AddNewMember.propTypes = {
    reload: PropTypes.func.isRequired,
    expandFunc: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired
};

export default AddNewMember;
