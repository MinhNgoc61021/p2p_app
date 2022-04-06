import './style.css'
import Peer from "peerjs";
import $ from 'jquery';
import io from 'socket.io-client';

// const socker = io('http://localhost:3001');

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
    // $('#btnSignup').click(() => {
    //     let username = $('#txtUsername').val();
    //     socker.emit('USERNAME_SIGN_UP', { username: username, peerId: id });
    // })
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

// socket.on('USER_LIST', userList => {
//     console.log(userList);
//
// })