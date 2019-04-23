function onSignIn(googleUser) {
    // let profile = googleUser.getBasicProfile();
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

function onMergeSignIn(googleUser) {
    // let profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    // console.log(id_token);

    let id_token = googleUser.getAuthResponse().id_token;

    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/auth/add/google');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('x-access-token',
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjYmY0MmZjZjk3Mjk5MzdkMDAzYzliMiIsImlhdCI6MTU1NjAzODM5NiwiZXhwIjoxNTU2MDQxOTk2fQ.nnjdsjAUAduTWmNMPku8G5zKNc0IUIRY40npD_mAFCI",
    );
    xhr.onload = function () {
        console.log(xhr.responseText);
    };
    xhr.send('idtoken=' + id_token);
}