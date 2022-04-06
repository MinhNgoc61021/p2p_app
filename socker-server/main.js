const io = require('socket.io')(3001, {
  cors: {
    origin: '*',
  }
});

const userInfoList = [];
io.on("connection", (socket) => {
    // send a message to the client
    socket.on('USERNAME_SIGN_UP', userInfo => {
        const isExist = userInfoList.some(user => user.username === userInfo.username)
        if (isExist) {
            return socket.emit('USER_ALREADY_EXIST');
        }
        socket.peerId = userInfo.peerId;
        userInfoList.push(userInfo);
        socket.emit('USER_LIST', userInfoList);
        socket.broadcast.emit('NEW_USER', userInfo)
    });
    socket.on('disconnect', () => {
        const index = userInfoList.findIndex((user => user.peerId === socket.peerId));
        userInfoList.splice(index, 1);
        io.emit('DISCONNECT_USER', socket.peerId);
    })
});