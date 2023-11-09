function getSubscriptionKeyFromEnv(){
    return "078933bfe87647b0a49024c377d1c468" /// a transformer en variable d'environnement !,;
}

const createApiUser = async (referenceId) => {
    return fetch("https://sandbox.momodeveloper.mtn.com/v1_0/apiuser", {
        method: "POST",
        body: JSON.stringify(body),
        // Request headers
        headers: {
            "X-Reference-Id": referenceId,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Ocp-Apim-Subscription-Key": getSubscriptionKeyFromEnv()
        },
    })
        .then((response) => {
            if (response.status != 201) {
                return false;
            }
            return true;
        });
}

/**
 * 
 * @param {string} transactionId 
 */
const generateApiKey = async (transactionId) => {
    let created = await createApiUser(transactionId);

    if (created) {

        await fetch(
            `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${transactionId}/apikey`,
            {
                method: "POST",
                // Request headers
                headers: {
                    "Cache-Control": "no-cache",
                    "Ocp-Apim-Subscription-Key": getSubscriptionKeyFromEnv(),
                },
            }
        )
            .then( async (response) => {
                if(response.status === 201) {
                    let obj = await response.json();
                    if(obj.apikey) {
                        return apikey;
                    }
                }
                console.log(response.status);
                console.log(response.text());
                /// continue here ?
            })
            .catch((err) => console.error(err));
    }
    else {

    }
}