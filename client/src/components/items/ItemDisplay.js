import React from 'react';

export const ItemDisplay = ({item, action}) => {
    return (<li className="collection-item collection-fit-buttons-properly">
        <div>
            <b>{item.name}</b>
            <ul>
                <li>Defence: {item.defence}</li>
                <li>Offence: {item.offence}</li>
                <li>Bonus: {item.bonus}</li>
            </ul>
        </div>
        <div className="secondary-content valign-wrapper">
            Value: {item.price} {action ? (<button className="center waves-effect waves-light btn btn-large" style={{marginLeft: "1em"}} onClick={() => action.func(item)}>
                {action.name}
            </button>) : null}
        </div>
    </li>);
};
