import './style.css'
import Peer from "peerjs";
import $ from 'jquery';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');


$('#video-chat').hide();

socket.on('USER_LIST', userList => {
    $('#sign-up').hide();
    $('#video-chat').show();
    userList.forEach(userInfo => {
        const {username, peerId} = userInfo;
        $('#userList').append(`<li style="cursor: pointer" id="${peerId}">${username}</li>`);
    })
    socket.on('NEW_USER', newUser => {
        const {username, peerId} = newUser;
            $('#userList').append(`<li id="${peerId}">${username}</li>`);
    });
    socket.on('DISCONNECT_USER', peerId => {
        $(`#${peerId}`).remove()
    });

})
socket.on('USER_ALREADY_EXIST', () =>
    alert("Nguoi dung da ton tai!!")
);



function openStream() {
    const config = {
        audio: true, video: true
    }
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    setTimeout(function () {
        video.play();
    }, 500);

}

// openStream().then(
//     stream => {
//         playStream('localStream', stream);
//     }
// )
//



const peer = new Peer();

peer.on('open', id => {
    $('#peer-id').append(id)
    $('#btnSignup').click(() => {
        let username = $('#txtUsername').val();
        socket.emit('USERNAME_SIGN_UP', { username: username, peerId: id });
    })
})

// Caller
$('#btnCall').click(() => {
    const id = $('#peer-id').text();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => {
            playStream('remoteStream', remoteStream)
        });
    });
});

peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
})

$('#userList').on('click', 'li', function () {
    console.log($(this).attr('id'));
    const id = $('#peer-id').text();
    const username = $("#" + $(this).attr('id')).text();
    if ($(this).attr('id') !== id) {
        if (confirm(`Do you want to video call with this user ${username}?`)) {
            openStream()
                .then(stream => {
                    playStream('localStream', stream);
                    const call = peer.call(id, stream);
                    call.on('stream', remoteStream => {
                        playStream('remoteStream', remoteStream)
                    });
                });
        }
    }
    else {
        alert(`You can't call yourself.`);
    }
})
