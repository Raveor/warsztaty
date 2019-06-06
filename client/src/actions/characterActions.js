import axios from "axios";
import {GET_ERRORS} from "./types";

export const registerUser = (userData, history) => dispatch => {
    axios
        .post("/character", userData)
        .then(res => history.push("/login"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response
            })
        );
};

export const getCharacter = (history) => dispatch => {
    axios
        .get("/character")
        .then(res => history.push("/character"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response
            })
        );
};