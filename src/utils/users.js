const users = [];

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required!"
        };
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // validat username
    if (existingUser) {
        return {
            error: "Username is in use!"
        }
    }

    // store user
    const user = { id, username, room };
    users.push(user);
    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }

};

const getUser = (id) => {
    return users.find((user) =>{
        return user.id === id;
    });
};
const getUsersInRoom = (room) => {
return users.filter((user) => {
    return user.room === room;
});

};

// addUser({
//     id: 22,
//     username: "Nevil",
//     room: "123"
// });

// addUser({
//     id: 23,
//     username: "Dhulo",
//     room: "123"
// });

// console.log(users);
// removeUser(22);
// console.log(users);

// console.log(getUser(22));
// console.log(getUsersInRoom("123"));

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};