import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from "react-router-dom";

class ClanItem extends Component {
    render() {
        let clan = this.props.clan;

        let buildings = [];
        Object.entries(clan.buildings).forEach(([key, val]) => {
            buildings.push(
                <p>{key[0].toUpperCase() + key.slice(1)}: {val} Lvl</p>
            )
        });

        return this.props.expanded ? (
            <div className="collection-item ">
                <div className="row">
                <span
                    className="title col s6"
                >
                    <h4>{clan.name}</h4>
                    <h5>Rank: {clan.rank}</h5>
                    {buildings}
                </span>

                    <div className="col s3 right">
                        <Link to={
                            {
                                pathname: '/clan/show',
                                state: {
                                    clanName: clan.name,
                                    clan: clan
                                }
                            }
                        } className="">
                            <button className="btn-large waves-effect waves-light">
                                <i className="material-icons">info</i>
                            </button>
                        </Link>
                    </div>
                </div>

                {/*<i className="grey-text">{category.clanname}</i>*/}
            </div>
        ) : (
            <a
                className="collection-item"
                onClick={() => this.props.expandFunc(clan._id)}
            >
                <div>
                    {clan.name}
                    <div className="secondary-content mr-10">
                        Rank: {clan.rank}
                    </div>
                </div>
            </a>
        );

    }
}

ClanItem.propTypes = {
    clan: PropTypes.object.isRequired,
    expandFunc: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired
};

export default ClanItem;
