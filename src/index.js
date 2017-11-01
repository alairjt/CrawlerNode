'use strict';

const request = require('request');
const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;
const vc = new VirtualConsole();
const checkUrl = /http/;
const PROCESS_LIMIT = 30;
const SELECTOR_SELECT_OPTIONS = '#deputado option';
const SELECTOR_CONTENT_IMAGE = '#content .clearedBox > img';
const SELECTOR_CONTENT_INFO = '#content .clearedBox > ul > li';

request(getOptions(), (error, response, body) => {
    if (error) {
        console.log('error:', error);
        return;
    }

    const dom = new JSDOM(body);

    let options = dom.window.document.querySelectorAll(SELECTOR_SELECT_OPTIONS);
    let deputies = Array.from(options).map((option) => {
        let id = option.value.split('?')[1];

        return {id: id, name: option.text};
    });

    // console.log(deputies);
    // deputies = [{id: 178957}];

    deputies.filter((deputy, index) => index < PROCESS_LIMIT).forEach((deputy) => {
        request(getOptionsInfo(deputy.id), (error, response, bodyInfo) => {
            //Error processing CSS in JSDOM
            //https://github.com/tmpvar/jsdom/issues/2005
            //https://github.com/tmpvar/jsdom/issues/1995
            const document = new JSDOM(bodyInfo, {virtualConsole:vc}).window.document;
            let photo = document.querySelector(SELECTOR_CONTENT_IMAGE);
            let infos = document.querySelectorAll(SELECTOR_CONTENT_INFO);
            infos = Array.from(infos)
            infos.push(photo);
            infos.filter(info => !!info).forEach((info) => {
                let r = parseDeputyInfo(info);
                if (Array.isArray(r)) {
                    r.forEach((data) => deputy[data.field] = data.value);
                }
            });

            console.log(deputy);
        });
    });
});

function getOptionsInfo(id) {
    let url = 'http://www.camara.leg.br/internet/Deputado/dep_Detalhe.asp?id={0}'.replace('{0}', id);
    return getRequestOptions(url);
}

function getOptions() {
    return getRequestOptions('http://www2.camara.leg.br/deputados/pesquisa');
}

function getRequestOptions(url) {
    return {
        url: url,
        headers: {
            'User-Agent': 'Chrome/61.0.3163.100'
        }
    };
}

function parseDeputyInfo(info) {
    let a = info.getElementsByTagName('a')[0] || {};
    let r = checkInfoType(a.href || info.src || info.textContent.trim());

    if (!r) {
        return;
    }

    r = Array.isArray(r) ? r : [r];

    r.forEach((data) => {
        switch (data.field) {
            case 'party':
                data.value = String(data.value.split(':')[1].split('/')[0]).trim();
                break;
            case 'phone':
            case 'postalCode':
                data.value = String(data.value.split(':')[1].split(' - ')[0]).trim();
                break;
            case 'office':
                data.value = String(data.value.split(':').filter((a, i) => i > 0).join(':')).trim();
                break;
            case 'state':
                data.value = String(data.value.split(':')[1].split(' / ')[1]).trim();
                break;
            case 'urlBio':
            case 'urlContact':
            case 'urlProfileImage':
                break;
    
            default:
                data.value = String(data.value.split(':')[1]).trim();
                break;
        }
    });
    
    return r;
}

function checkInfoType(info, label) {
    let checkTypes = [{
            regex: /jpg/g,
            field: 'urlProfileImage'
        },{
            regex: /biografia/g,
            field: 'urlBio'
        }, {
            regex: /fale-conosco/g,
            field: 'urlContact'
        }, {
            regex: /Nome civ/g,
            field: 'fullName'
        }, {
            regex: /Aniversário/g,
            field: 'birthday'
        }, {
            regex: /Partido/g,
            field: 'party'
        }, {
            regex: /Partido/g,
            field: 'state'
        }, {
            regex: /Telefone/g,
            field: 'phone'
        }, {
            regex: /Legislaturas/g,
            field: 'legislatures'
        }, {
            regex: /Gabinete/g,
            field: 'office'
        }, {
            regex: /CEP/g,
            field: 'postalCode'
        }
    ];

    return checkTypes.filter((ck) => ck.regex.test(info)).map((ck) => {
        return {field: ck.field, value: info};
    });
}