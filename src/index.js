'use strict';

const request = require('request');
const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;
const vc = new VirtualConsole();

request(getOptions(), (error, response, body) => {
    if (error) {
        console.log('error:', error);
        return;
    }

    const dom = new JSDOM(body);

    let options = dom.window.document.querySelectorAll('#deputado option');
    let deputies = Array.from(options).map((option) => {
        let id = option.value.split('?')[1];

        return {id: id, name: option.text};
    });

    // console.log(deputies);
    deputies = [{id: 178957}];

    deputies.forEach((deputy) => {
        request(getOptionsInfo(deputy.id), (error, response, bodyInfo) => {
            //Error processing CSS in JSDOM
            //https://github.com/tmpvar/jsdom/issues/2005
            //https://github.com/tmpvar/jsdom/issues/1995
            const document = new JSDOM(bodyInfo, {virtualConsole:vc}).window.document;
            let photo = document.querySelector('#content .clearedBox > img') || {};
            let infos = document.querySelectorAll('#content .clearedBox > ul > li');
            infos = Array.from(infos)
            infos.push(photo);
            infos.forEach((info) => {
                let r = parseDeputyInfo(info);
                if (r) {
                    deputy[r.field] = r.value;
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
    let a = info.getElementsByTagName('a')[0];
    if (a) {
        return checkInfoType(a.href);
    }

    let r = checkInfoType(info.src || info.textContent.trim());
    if (r && r.value) {
        r.value = String(r.value.split(':')[1]).trim();
    }
    
    return r;
}

function checkInfoType(info, label) {
    let checkUrl = /http/;
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
            regex: /UF/g,
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
    })[0];
}