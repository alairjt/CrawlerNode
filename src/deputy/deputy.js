'use strict';

const deputyParsers = require('./deputyParser');

const URL_INFO = 'http://www.camara.leg.br/internet/Deputado/dep_Detalhe.asp?id={0}';
const URL_SEARCH = 'http://www2.camara.leg.br/deputados/pesquisa';
const USER_AGENT = 'Chrome/61.0.3163.100';
const SELECTOR_SELECT_OPTIONS = '#deputado option';
const SELECTOR_CONTENT_IMAGE = '#content .clearedBox > img';
const SELECTOR_CONTENT_INFO = '#content .clearedBox > ul > li';
const DEFAULT_PROCESS_LIMIT = 100;
const HTTP_CODE_SUCCESS = 200;

/**
 * Deputy Crawler
 * 
 * Process URL to retrieve info of the Federal Deputies.
 */
class DeputyCrawler {
    /**
     * @constructor
     * @param {*} ApiClient API Deputy Client 
     * @param {*} request Request library
     * @param {*} jsDom JSDom library
     * @param {*} virtualConsole Virtual Console from jsdom
     * @param {*} processLimit Limit of executed processes
     */
    constructor(ApiClient, request, jsDom, virtualConsole, processLimit) {
        this.request = request;
        this.jsDom = jsDom;
        this.virtualConsole = virtualConsole;
        this.processLimit = processLimit || DEFAULT_PROCESS_LIMIT;
        this.ApiClient = new ApiClient(request);
    }

    /**
     * Starts the crawler job.
     */
    start() {
        this.request(this.getOptions(), (error, response, body) => {
            if (error) {
                console.log('error:', error);
                return;
            }

            const dom = new this.jsDom(body, { virtualConsole: this.virtualConsole })

            let options = dom.window.document.querySelectorAll(SELECTOR_SELECT_OPTIONS);
            let deputies = Array.from(options).map((option) => {
                let id = option.value.split('?')[1];

                return { id: id, name: option.text };
            });

            deputies.filter((deputy, index) => index < this.processLimit).forEach((deputy) => {
                this.request(this.getOptionsInfo(deputy.id), (errorInfo, response, bodyInfo) => {
                    if (error) {
                        console.log('error:', errorInfo);
                        return;
                    }
                    //Error processing CSS in JSDOM
                    //https://github.com/tmpvar/jsdom/issues/2005
                    //https://github.com/tmpvar/jsdom/issues/1995
                    const document = new this.jsDom(bodyInfo, { virtualConsole: this.virtualConsole }).window.document;
                    let photo = document.querySelector(SELECTOR_CONTENT_IMAGE);
                    let infos = document.querySelectorAll(SELECTOR_CONTENT_INFO);
                    infos = Array.from(infos)
                    infos.push(photo);
                    infos.filter(info => !!info).forEach((info) => {
                        let r = this.parseDeputyInfo(info);
                        if (Array.isArray(r)) {
                            r.forEach((data) => deputy[data.field] = data.value);
                        }
                    });

                    this.persist(deputy);
                });
            });
        });
    }

    /**
     * Persist info in database.
     * 
     * @param {*} deputy Deputy entity 
     */
    persist(deputy) {
        if (!deputy && !deputy.id) {
            return;
        }

        //ToDo: check if deputy already exists
        this.ApiClient.save(deputy, (error, response, body) => {
            if (error || response.statusCode !== HTTP_CODE_SUCCESS) {
                console.log('Error: ', deputy.name, error);
                return;
            }

            console.log('Success: ', deputy.name);
        });
    }

    /**
     * Parse deputy info
     * @param {*} info Deputy info 
     * @return Parsed info
     */
    parseDeputyInfo(info) {
        let link = info.getElementsByTagName('a')[0] || {};
        let infoType = this.checkInfoType(link.href || info.src || info.textContent.trim());

        if (!info) {
            return;
        }

        infoType = Array.isArray(infoType) ? infoType : [infoType];
        infoType.forEach((data) => data.value = data.parser(data.value));

        return infoType;
    }

    /**
     * Check deputy info
     * @param {*} info Deputy info 
     * @return Info to parse
     */
    checkInfoType(info) {
        return deputyParsers.filter((ck) => ck.regex.test(info)).map((ck) => {
            return { field: ck.field, value: info, parser: ck.parser };
        });
    }

    /**
     * Get request options to parse Deputy info
     * @param {number} id Deputy ID
     * @return request options with deputy info url
     */
    getOptionsInfo(id) {
        let url = URL_INFO.replace('{0}', id);
        return this.getRequestOptions(url);
    }

    /**
     * Get request options to parse Deputies list
     * @return request options with search url
     */
    getOptions() {
        return this.getRequestOptions(URL_SEARCH);
    }

    /**
     * Create request options
     * @param {*} url URL
     * @return request options
     */
    getRequestOptions(url) {
        return {
            url: url,
            headers: {
                'User-Agent': USER_AGENT
            }
        };
    }
}

exports.DeputyCrawler = DeputyCrawler;