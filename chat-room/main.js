import './style.css'
import AgoraRTC from "agora-rtc-sdk-ng";
import $ from 'jquery';

// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `

const APP_ID = "0ce7bea6b88845d5a73590e948879343";
const TOKEN = "0060ce7bea6b88845d5a73590e948879343IACzpRXv7vyuu1Wg1+TLwTWCGV8XfZwNHxJBc0qoIhtcA2TNKL8AAAAAEABTKt08XN1PYgEAAQBY3U9i";
const Channel = 'main';
const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)

    client.on('user-left', handleUserLeft)
    let UID = await client.join(APP_ID, Channel, TOKEN, null)
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`;
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
    localTracks[1].play(`user-${UID}`)
    await client.publish(localTracks[0], localTracks[1])
}

let handleUserJoined = async (user, mediaType) => {

    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);
    console.log('bebe2')
    console.log(mediaType)
    let player = document.getElementById(`user-container-${user.uid}`)
    if (player != null){
        player.remove()
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
                      <div class="video-player" id="user-${user.uid}"></div> 
              </div>`
    console.log('bebe3')
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    console.log(document.getElementById('video-streams'))
    user.videoTrack.play(`user-${user.uid}`)

    if (mediaType === 'audio'){
        user.audioTrack.play();
    }
}

$('#joinBtn').click(async () => {
    await joinAndDisplayLocalStream();
    $('#joinBtn').hide();
    $('#stream-control').css({display: 'block'});
})

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    document.getElementById('video-streams').innerHTML = ''
    $('#joinBtn').css("display", "block");
}

$('#leaveBtn').click(async () => {
    await leaveAndRemoveLocalStream();
    $('#leaveBtn').hide();
    $('#stream-control').css({display: 'block'});
})

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'white'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'white'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}


document.getElementById('micBtn').addEventListener('click', toggleMic)
document.getElementById('cameraBtn').addEventListener('click', toggleCamera)