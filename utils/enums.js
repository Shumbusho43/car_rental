//user roles enum
const userRoles = Object.freeze({
    client: "client",
    admin: "admin",
    owner: "owner",
});
//car hired enum
const carHired = Object.freeze({
    hired: true,
    notHired: false,
});
//EXPORTING
module.exports.userRoles = userRoles;
module.exports.carHired = carHired;