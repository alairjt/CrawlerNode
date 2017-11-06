/**
 * Client from Deputy API.
 */
class DeputyApiClient {
    /**
     * @constructor
     * @param {*} request Request library 
     */
    constructor(request) {
        this.request = request;
        this.url = process.env.DEPUTIES_API_URL || 'http://localhost:5000/api/deputies';
        console.log('API Url:', this.url);
    }

    /**
     * Save a new deputy
     * @param {*} deputy Deputy 
     * @param {Function} callback Callback function
     */
    save(deputy, callback) {
        callback = callback || this._noop();

        this.request({
            url: this.url,
            method: 'POST',
            json: deputy
        }, (error, response, body) => callback(error, response, body));
    }

    /**
     * Update a deputy
     * @param {number} id Deputy ID
     */
    update(id) {
        //ToDo: soon
    }

    /**
     * Find a deputy by id
     * @param {number} id Deputy ID
     */
    findById(id) {
       //ToDo: soon 
    }

    /**
     * Noop function
     */
    _noop() {
        return function(){};
    }
}

module.exports = DeputyApiClient;