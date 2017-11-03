'use strict';

const deputyParsers = require('./deputyParser');

const URL_INFO = 'http://www.camara.leg.br/internet/Deputado/dep_Detalhe.asp?id={0}';
const URL_SEARCH = 'http://www2.camara.leg.br/deputados/pesquisa';
const USER_AGENT = 'Chrome/61.0.3163.100';
const SELECTOR_SELECT_OPTIONS = '#deputado option';
const SELECTOR_CONTENT_IMAGE = '#content .clearedBox > img';
const SELECTOR_CONTENT_INFO = '#content .clearedBox > ul > li';
const DEFAULT_PROCESS_LIMIT = 100;

class DeputyCrawler {
    constructor(request, jsDom, virtualConsole, processLimit) {
        this.request = request;
        this.jsDom = jsDom;
        this.virtualConsole = virtualConsole;
        this.processLimit = processLimit || DEFAULT_PROCESS_LIMIT;
    }

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

    persist(deputy) {
        if (!deputy && !deputy.id) {
            return;
        }

        console.log(deputy);
        //ToDo: check if deputy already exists in the database
        return;
        this.request({
            url: 'http://localhost:3000/deputies',
            method: 'POST',
            json: deputy
        }, (error, response, body) => {
            if (error) {
                console.log(error, body);
            }
        });
    }

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

    checkInfoType(info) {
        return deputyParsers.filter((ck) => ck.regex.test(info)).map((ck) => {
            return { field: ck.field, value: info, parser: ck.parser };
        });
    }

    getOptionsInfo(id) {
        let url = URL_INFO.replace('{0}', id);
        return this.getRequestOptions(url);
    }

    getOptions() {
        return this.getRequestOptions(URL_SEARCH);
    }

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