const uuid = require("uuid");
const externalTransactionId = uuid.v4();

const { ApiAuthenticationByReference } = require("../utils/api/authentication");

let authHandler = new ApiAuthenticationByReference(externalTransactionId);

authHandler.authenticate()
.then((token) => {
    console.log("TOKEN: ", token);
});
