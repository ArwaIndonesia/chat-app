const users = [];

const addUser = ({ id, userName, room }) => {
  userName = userName.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!userName || !room) {
    return {
      error: "username and room are required",
    };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.userName === userName;
  });

  if (existingUser) {
    return {
      error: "username already in use",
    };
  }

  const user = { id, userName, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// addUser({
//   id: 22,
//   username: "Arwa",
//   room: "south",
// });

// addUser({
//   id: 23,
//   username: "Arwa Indonesias",
//   room: "south",
// });

// const res = addUser({
//   id: 33,
//   username: "Arwa",
//   room: "south",
// });

// const removeduser = removeUser(22);

// console.log(removeduser);

// // console.log(res);

// console.log(users);

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInroom = (room) => {
  const usersInroom = users.filter((user) => user.room === room);
  return usersInroom;
};

// const res = getUser(22);
// console.log(res);

// const res1 = getUsersInroom("south");
// console.log(res1);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInroom,
};
