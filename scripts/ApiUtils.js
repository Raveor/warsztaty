class ApiError {
    constructor(message) {
        this.result = "error";
        this.message = message;
    }
}

class ApiToken {
    constructor(token) {
        this.result = "ok";
        this.token = token;
    }
}

exports.getApiError = function (message) {
    return new ApiError(message)
};

exports.getApiToken = function (token) {
    return new ApiToken(token)
};