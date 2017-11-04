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
});