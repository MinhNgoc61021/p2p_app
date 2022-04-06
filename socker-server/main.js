const io = require('socket.io')(3001, {
  cors: {
    origin: '*',
  }
});

const userInfoList = [];
io.on("connection", (socket) => {
  // send a message to the client
  socket.on('USERNAME_SIGN_UP', userInfo => {
      userInfoList.push(userInfo);
      socket.emit('USER_LIST', userInfoList);
  })
});