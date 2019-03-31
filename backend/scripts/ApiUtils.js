class ApiError {
    constructor(message) {
        this.result = "Error";
        this.message = message;
    }
}

exports.getError = function (message) {
    return new ApiError(message)
};