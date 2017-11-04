'use strict';

const request = require('request');
const { JSDOM, VirtualConsole } = require('jsdom');
const { DeputyCrawler } = require('./deputy/deputy');
const ApiClient = require('./deputy/deputyApiClient');

const PROCESS_LIMIT = 500;

try {
    let virtualConsole = new VirtualConsole();
    let crawler = new DeputyCrawler(ApiClient, request, JSDOM, virtualConsole, PROCESS_LIMIT);
    crawler.start();
} catch (error) {
    console.log(error);
}