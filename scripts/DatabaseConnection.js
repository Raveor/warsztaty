const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://test:test@warsztaty-20e9j.azure.mongodb.net/test?retryWrites=true", {useNewUrlParser: true}
).catch(reason => {
    console.log("MongoDB error: " + reason.message)
});