class DeputyApiClient {
    constructor(request) {
        this.request = request;
        this.url = process.env.DEPUTIES_API_URL || 'http://localhost:5000/deputies';
        console.log('API Url:', this.url);
    }

    save(deputy, callback) {
        callback = callback || this._noop();

        this.request({
            url: this.url,
            method: 'POST',
            json: deputy
        }, (error, response, body) => callback(error, response, body));
    }

    update() {
        //ToDo: soon
    }

    findById(id) {
       //ToDo: soon 
    }

    _noop() {
        return function(){};
    }
}

module.exports = DeputyApiClient;