module.exports = {
    //JWT
    'jwtSecret': 'supersecret',
    'jwtTime': 3600,

    //CLIENT HOST ADDRESS
    'clientHost': "http://localhost:5000",

    //EMAIL
    'SendGridUsername': "zespolowe2019dev",
    'SendGridPass': "y5DsrgGnpaE5LJ2S",
    'fromAddress': "noreply@example.com",

    //REGISTRATION
    'minUsernameChars': 4,
    'minPasswordChars': 4,

    //GOOGLE AUTH
    'clientId': '47235264901-4sg3llq7r8trvo2g2krs7qmouqe16m4a.apps.googleusercontent.com',

    //EXPEDITION
    'userExpeditions': 5,
    'expeditionMinTime': 1000 * 60 * 5,
    'expeditionMaxTime': 1000 * 60 * 45,

    //CHARACTER - STATS
    'statPointsPerLevel': 5,
    'healthPointsPerLevel': 4 
};