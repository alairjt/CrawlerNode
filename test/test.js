var assert = require('assert');
var request = require('request');
var { JSDOM, VirtualConsole } = require('jsdom');
var vc = new VirtualConsole();
var { DeputyCrawler } = require('../src/deputy/deputy');

describe('Deputy Crawler', () => {
    var crawler;
    var ApiClientMock = function() {
        this.save = () => {};
    };

    beforeEach(() => {
        crawler = new DeputyCrawler(ApiClientMock, request, JSDOM, vc);
    });

    it('should be inatilize crawler', () => {
        assert.equal(crawler.request, request);
        assert.equal(crawler.jsDom, JSDOM);
        assert.equal(crawler.virtualConsole, vc);
        assert.equal(crawler.processLimit, 100);
    });

    it('should be create request options', () => {
        let url = 'http://dummyy';
        let options = crawler.getRequestOptions(url);

        assert.equal(options.url, url);
        assert.equal(options.headers['User-Agent'], 'Chrome/61.0.3163.100');
    });

    it('should be create request info options', () => {
        let expectedUrl = 'http://www.camara.leg.br/internet/Deputado/dep_Detalhe.asp?id=12321';
        let options = crawler.getOptionsInfo(12321);

        assert.equal(options.url, expectedUrl);
        assert.equal(options.headers['User-Agent'], 'Chrome/61.0.3163.100');
    });

    it('should be check fullName info from body', () => {
        let a = crawler.checkInfoType('Nome civil: ABEL SALVADOR MESQUITA JUNIOR');
        assert.equal(a[0].field, 'fullName');
        assert.equal(a[0].value, 'Nome civil: ABEL SALVADOR MESQUITA JUNIOR');
        assert.equal(a.length, 1);
    });

    it('should be check birthday info from body', () => {
        let a = crawler.checkInfoType('Aniversário: 29 / 3');
        assert.equal(a[0].field, 'birthday');
        assert.equal(a[0].value, 'Aniversário: 29 / 3');
        assert.equal(a.length, 1);
    });

    it('should be check party info from body', () => {
        let a = crawler.checkInfoType('Partido/UF: DEM / RR / Titular');
        assert.equal(a[0].field, 'party');
        assert.equal(a[0].value, 'Partido/UF: DEM / RR / Titular');
        assert.equal(a.length, 2);
    });

    it('should be check phone info from body', () => {
        let a = crawler.checkInfoType('Telefone: (61) 3215-5248 - Fax: 3215-2248');
        assert.equal(a[0].field, 'phone');
        assert.equal(a[0].value, 'Telefone: (61) 3215-5248 - Fax: 3215-2248');
        assert.equal(a.length, 1);
    });

    it('should be parse deputy info', () => {
        let infoMock = {
            getElementsByTagName: (a) => [{href: 'http://mockinfo'}]
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 0);
    });

    it('should be parse deputy info - href', () => {
        let infoMock = {
            getElementsByTagName: (a) => [{href: 'http://mockinfo/image.jpg'}]
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, 'http://mockinfo/image.jpg');
    });

    it('should be parse deputy info - src', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            src: 'http://biografia.com'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, 'http://biografia.com');
    });

    it('should be parse deputy info - textContent', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'Nome civil: JOSE ADAIL CARNEIRO SILVA'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, 'JOSE ADAIL CARNEIRO SILVA');
    });

    it('should be check url contact info from body', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            src: 'http://fale-conosco.com'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, 'http://fale-conosco.com');
        assert.equal(infoType[0].field, 'urlContact');
    });

    it('should be parse deputy info - birthday', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'Aniversário: 19 / 11'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, '19 / 11');
        assert.equal(infoType[0].field, 'birthday');
    });

    it('should be parse deputy info - party and state', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'Partido/UF: PP / CE / Titular'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 2);
        assert.equal(infoType[0].value, 'PP');
        assert.equal(infoType[0].field, 'party');
        assert.equal(infoType[1].value, 'CE');
        assert.equal(infoType[1].field, 'state');
    });

    it('should be parse deputy info - phone', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'Telefone: (61) 3215-5335 - Fax: 3215-2335'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, '(61) 3215-5335');
        assert.equal(infoType[0].field, 'phone');
    });

    it('should be parse deputy info - legislatures', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'Legislaturas: 15/19'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, '15/19');
        assert.equal(infoType[0].field, 'legislatures');
    });

    it('should be parse deputy info - office', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'Gabinete: 335 - Anexo: IV'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, '335 - Anexo: IV');
        assert.equal(infoType[0].field, 'office');
    });

    it('should be parse deputy info - postalCode', () => {
        let infoMock = {
            getElementsByTagName: (a) => [],
            textContent: 'CEP: 70160-900'
        };
        
        let infoType = crawler.parseDeputyInfo(infoMock);

        assert.equal(infoType.length, 1);
        assert.equal(infoType[0].value, '70160-900');
        assert.equal(infoType[0].field, 'postalCode');
    });
});