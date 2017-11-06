'use strict';

/**
 * Deputy info parser.
 */
const deputyParser = [{
        regex: /jpg/g,
        field: 'urlProfileImage',
        parser: value => value
    }, {
        regex: /biografia/g,
        field: 'urlBio',
        parser: value => value
    }, {
        regex: /fale-conosco/g,
        field: 'urlContact',
        parser: value => value
    }, {
        regex: /Nome civ/g,
        field: 'fullName',
        parser: value => String(value.split(':')[1]).trim()
    }, {
        regex: /Aniversário/g,
        field: 'birthday',
        parser: (value) => String(value.split(':')[1]).trim()
    }, {
        regex: /Partido/g,
        field: 'party',
        parser: value => String(value.split(':')[1].split('/')[0]).trim()
    }, {
        regex: /Partido/g,
        field: 'state',
        parser: value => String(value.split(':')[1].split(' / ')[1]).trim()
    }, {
        regex: /Telefone/g,
        field: 'phone',
        parser: value => String(value.split(':')[1].split(' - ')[0]).trim()
    }, {
        regex: /Legislaturas/g,
        field: 'legislatures',
        parser: value => String(value.split(':')[1]).trim()
    }, {
        regex: /Gabinete/g,
        field: 'office',
        parser: value => String(value.split(':').filter((a, i) => i > 0).join(':')).trim()
    }, {
        regex: /CEP/g,
        field: 'postalCode',
        parser: value => String(value.split(':')[1].split(' - ')[0]).trim()
    }
];

module.exports = deputyParser;
