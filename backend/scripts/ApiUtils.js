class ApiError {
    constructor(message) {
        this.result = "error";
        this.message = message;
    }
}

exports.getApiError = function (message) {
    return new ApiError(message)
};