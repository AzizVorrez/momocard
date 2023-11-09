function getSubscriptionKeyFromEnv() {
    return "078933bfe87647b0a49024c377d1c468" /// a transformer en variable d'environnement !,;
}

export class ApiAuthenticationByReference {

    referenceId = '';
    apiKey = '';
    accessToken = '';

    constructor(referenceId) {
        this.referenceId = referenceId;
    }

    get subscriptionKey() {
        return getSubscriptionKeyFromEnv();
    }

    /**
     * 
     * @param {string} referenceId 
     * @param {string} apiKey 
     * @returns 
     */
    generateBasicAuthToken() {
        return Buffer.from(`${this.referenceId}:${this.apiKey}`).toString("base64");
    }

    /**
     * 
     * @returns {Promise<boolean>}
     */
    async createApiUser() {
        return fetch("https://sandbox.momodeveloper.mtn.com/v1_0/apiuser", {
            method: "POST",
            body: JSON.stringify(body),
            // Request headers
            headers: {
                "X-Reference-Id": this.referenceId,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Ocp-Apim-Subscription-Key": this.subscriptionKey
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
     * @returns {Promise<string>}
     */
    async generateApiKey() {

        let created = await this.createApiUser(this.transactionId);

        if (!created) {
            return undefined;
        }

        let apiKey = await fetch(
            `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${this.transactionId}/apikey`,
            {
                method: "POST",
                // Request headers
                headers: {
                    "Cache-Control": "no-cache",
                    "Ocp-Apim-Subscription-Key": getSubscriptionKeyFromEnv(),
                },
            }
        )
            .then(async (response) => {
                if (response.status === 201) {
                    let obj = await response.json();
                    if (obj.apiKey) {
                        this.apiKey = obj.apiKey;
                        return obj.apiKey;
                    }
                }

                return undefined;
            })
            .catch((err) => {
                console.error(err);
                return undefined;
            });

        return apiKey;
    }

    /**
     * 
     * @returns {Promise<string>}
     */
    async authenticate() {

        await this.generateApiKey();
        if (!this.apiKey) {
            return undefined;
        }

        let authToken = this.generateBasicAuthToken();

        await fetch("https://sandbox.momodeveloper.mtn.com/collection/token/", {
            method: "POST",
            headers: {
                Authorization:
                    `Basic ${authToken}`,
                "Cache-Control": "no-cache",
                "Ocp-Apim-Subscription-Key":
                    this.subscriptionKey,
            },
        })
            .then(async (res) => {
                let jsonRes = await res.json();
                if (jsonRes.access_token) {
                    this.accessToken = jsonRes.access_token;
                    return this.accessToken;
                }
            });
    }

}


module.exports = { ApiAuthenticationByReference };