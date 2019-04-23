function onSignIn(googleUser) {
    let profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    // console.log(id_token);

    let id_token = googleUser.getAuthResponse().id_token;


    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/auth/google');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        console.log(xhr.responseText);
    };
    xhr.send('idtoken=' + id_token);
}