'use strict';

const request = require('request');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
const PROCESS_LIMIT = 30;

const { DeputyCrawler } = require('./deputy');

try {
    let crawler = new DeputyCrawler(request, JSDOM, vc, PROCESS_LIMIT);
    crawler.start();
} catch (error) {
    console.log(error);
}