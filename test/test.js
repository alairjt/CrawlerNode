const assert = require('assert');
const request = require('request');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
const { DeputyCrawler } = require('../src/deputy');

describe('Deputy Crawler', () => {
    var crawler;
    beforeEach(() => {
        crawler = new DeputyCrawler(request, JSDOM, vc);
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
});