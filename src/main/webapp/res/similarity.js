//# sourceURL=file:///res/similarity.js

function FuzzySet(row, arr, useLevenshtein, gramSizeLower, gramSizeUpper) {
    "use strict";

    var fuzzyset = {
        version: '0.0.1'
    };

    // default options
    arr = arr || [];
    fuzzyset.gramSizeLower = gramSizeLower || 2;
    fuzzyset.gramSizeUpper = gramSizeUpper || 3;
    fuzzyset.useLevenshtein = (typeof useLevenshtein !== 'boolean') ? true : useLevenshtein;

    // define all the object functions and attributes
    fuzzyset.exactSet = {};
    fuzzyset.matchDict = {};
    fuzzyset.items = {};

    // helper functions
    var levenshtein = function (str1, str2) {
        var current = [], prev, value;

        for (var i = 0; i <= str2.length; i++)
            for (var j = 0; j <= str1.length; j++) {
                if (i && j)
                    if (str1.charAt(j - 1) === str2.charAt(i - 1))
                        value = prev;
                    else
                        value = Math.min(current[j], current[j - 1], prev) + 1;
                else
                    value = i + j;

                prev = current[j];
                current[j] = value;
            }

        return current.pop();
    };

    // return an edit distance from 0 to 1
    var _distance = function (str1, str2) {
        if (str1 === null && str2 === null)
            throw 'Trying to compare two null values';
        if (str1 === null || str2 === null)
            return 0;
        str1 = String(str1);
        str2 = String(str2);

        var distance = levenshtein(str1, str2);
        if (str1.length > str2.length) {
            return 1 - distance / str1.length;
        } else {
            return 1 - distance / str2.length;
        }
    };
    var _nonWordRe = /[^\w, ]+/;

    var _iterateGrams = function (value, gramSize) {
        gramSize = gramSize || 2;
        var simplified = '-' + value.toLowerCase().replace(_nonWordRe, '') + '-',
                lenDiff = gramSize - simplified.length,
                results = [];
        if (lenDiff > 0) {
            for (var i = 0; i < lenDiff; ++i) {
                value += '-';
            }
        }
        for (var i = 0; i < simplified.length - gramSize + 1; ++i) {
            results.push(simplified.slice(i, i + gramSize));
        }
        return results;
    };

    var _gramCounter = function (value, gramSize) {
        // return an object where key=gram, value=number of occurrences
        gramSize = gramSize || 2;
        var result = {},
                grams = _iterateGrams(value, gramSize),
                i = 0;
        for (i; i < grams.length; ++i) {
            if (grams[i] in result) {
                result[grams[i]] += 1;
            } else {
                result[grams[i]] = 1;
            }
        }
        return result;
    };

    // the main functions
    fuzzyset.get = function (value, defaultValue) {
        // check for value in set, returning defaultValue or null if none found
        var result = this._get(value);
        if (!result && typeof defaultValue !== 'undefined') {
            return defaultValue;
        }
        return result;
    };

    fuzzyset._get = function (value) {
        var normalizedValue = this._normalizeStr(value),
                result = this.exactSet[normalizedValue];
        if (result) {
            return [[1, result]];
        }

        var results = [];
        // start with high gram size and if there are no results, go to lower gram sizes
        for (var gramSize = this.gramSizeUpper; gramSize >= this.gramSizeLower; --gramSize) {
            results = this.__get(value, gramSize);
            if (results) {
                return results;
            }
        }
        return null;
    };

    fuzzyset.__get = function (value, gramSize) {
        var normalizedValue = this._normalizeStr(value),
                matches = {},
                gramCounts = _gramCounter(normalizedValue, gramSize),
                items = this.items[gramSize],
                sumOfSquareGramCounts = 0,
                gram,
                gramCount,
                i,
                index,
                otherGramCount;

        for (gram in gramCounts) {
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.matchDict) {
                for (i = 0; i < this.matchDict[gram].length; ++i) {
                    index = this.matchDict[gram][i][0];
                    otherGramCount = this.matchDict[gram][i][1];
                    if (index in matches) {
                        matches[index] += gramCount * otherGramCount;
                    } else {
                        matches[index] = gramCount * otherGramCount;
                    }
                }
            }
        }

        function isEmptyObject(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        }

        if (isEmptyObject(matches)) {
            return null;
        }

        var vectorNormal = Math.sqrt(sumOfSquareGramCounts),
                results = [],
                matchScore;
        // build a results list of [score, str]
        for (var matchIndex in matches) {
            matchScore = matches[matchIndex];
            results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
        }
        var sortDescending = function (a, b) {
            if (a[0] < b[0]) {
                return 1;
            } else if (a[0] > b[0]) {
                return -1;
            } else {
                return 0;
            }
        };
        results.sort(sortDescending);
        if (this.useLevenshtein) {
            var newResults = [],
                    endIndex = Math.min(50, results.length);
            // truncate somewhat arbitrarily to 50
            for (var i = 0; i < endIndex; ++i) {
                newResults.push([_distance(results[i][1], normalizedValue), results[i][1]]);
            }
            results = newResults;
            results.sort(sortDescending);
        }
        var newResults = [];
        for (var i = 0; i < results.length; ++i) {
            if (results[i][0] == results[0][0]) {
                newResults.push([results[i][0], this.exactSet[results[i][1]]]);
            }
        }
        return newResults;
    };

    fuzzyset.add = function (value) {
        var normalizedValue = this._normalizeStr(value);
        if (normalizedValue in this.exactSet) {
            return false;
        }

        var i = this.gramSizeLower;
        for (i; i < this.gramSizeUpper + 1; ++i) {
            this._add(value, i);
        }
    };

    fuzzyset._add = function (value, gramSize) {
        var normalizedValue = this._normalizeStr(value),
                items = this.items[gramSize] || [],
                index = items.length;

        items.push(0);
        var gramCounts = _gramCounter(normalizedValue, gramSize),
                sumOfSquareGramCounts = 0,
                gram, gramCount;
        for (gram in gramCounts) {
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.matchDict) {
                this.matchDict[gram].push([index, gramCount]);
            } else {
                this.matchDict[gram] = [[index, gramCount]];
            }
        }
        var vectorNormal = Math.sqrt(sumOfSquareGramCounts);
        items[index] = [vectorNormal, normalizedValue];
        this.items[gramSize] = items;
        this.exactSet[normalizedValue] = value;
    };

    fuzzyset._normalizeStr = function (str) {
        if (Object.prototype.toString.call(str) !== '[object String]')
            throw 'Must use a string as argument to FuzzySet functions';
        return str.toLowerCase();
    };

    // return length of items in set
    fuzzyset.length = function () {
        var count = 0,
                prop;
        for (prop in this.exactSet) {
            if (this.exactSet.hasOwnProperty(prop)) {
                count += 1;
            }
        }
        return count;
    };

    // return is set is empty
    fuzzyset.isEmpty = function () {
        for (var prop in this.exactSet) {
            if (this.exactSet.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };

    // return list of values loaded into set
    fuzzyset.values = function () {
        var values = [],
                prop;
        for (prop in this.exactSet) {
            if (this.exactSet.hasOwnProperty(prop)) {
                values.push(this.exactSet[prop]);
            }
        }
        return values;
    };

    fuzzyset.search = (searchTerm, searchableString) => {
        searchableString = searchableString || row.getSearchableString();
        var searchSet = fuzzyset.get(searchTerm);


        var includeSearchVal = (searchableString || '').toLowerCase().includes((searchTerm || '').toLowerCase());

        if (includeSearchVal) {
            return true;
        } else {
            if (searchSet)
                searchSet.forEach(function (element, i) {
                    if (element[0] >= 0.55)
                        includeSearchVal = (searchableString || '')
                                .toLowerCase().includes((element[1] || '').toLowerCase());
                });

            if (includeSearchVal) {
                return true;
            } else {
                return false;
            }
        }
    };

    fuzzyset.clean = () => {
        this.exactSet = {};
    };

    // initialization
    var i = fuzzyset.gramSizeLower;
    for (i; i < fuzzyset.gramSizeUpper + 1; ++i) {
        fuzzyset.items[i] = [];
    }
    // add all the items to the set
    for (i = 0; i < arr.length; ++i) {
        fuzzyset.add(arr[i]);
    }

    return fuzzyset;
}


window.LanguageDisplays = {};
window.LanguageDisplays.nativeNames = {'hi': '\u0939\u093f\u0928\u094d\u0926\u0940', 'ps': '\u067e\u069a\u062a\u0648', 'fil': 'Filipino', 'hmn': 'Hmong', 'hr': 'Hrvatski', 'ht': 'Haitian', 'hu': 'magyar', 'yi': '\u05d9\u05d9\u05b4\u05d3\u05d9\u05e9', 'hy': '\u0570\u0561\u0575\u0565\u0580\u0565\u0576', 'zh-Hans': '\u7b80\u4f53\u4e2d\u6587\uff08\u4e2d\u56fd\uff09', 'zh-Hant': '\u7e41\u9ad4\u4e2d\u6587\uff08\u53f0\u7063\uff09', 'id': 'Bahasa Indonesia', 'af': 'Afrikaans', 'is': '\u00edslenska', 'it': 'Italiano', 'am': '\u12a0\u121b\u122d\u129b', 'iu': 'Inuktitut', 'ar': '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', 'pt-PT': 'portugu\u00eas (Portugal)', 'ja': '\u65e5\u672c\u8a9e', 'az': 'az\u0259rbaycan', 'zu': 'isiZulu', 'ro': 'rom\u00e2n\u0103', 'ceb': 'Cebuano', 'ru': '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', 'be': '\u0431\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f', 'bg': '\u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438', 'bn': '\u09ac\u09be\u0982\u09b2\u09be', 'jv': 'Javanese', 'jw': 'Javanese', 'sa': 'Sanskrit', 'bs': 'bosanski', 'see': 'Seneca', 'zh-yue': 'Cantonese', 'si': '\u0dc3\u0dd2\u0d82\u0dc4\u0dbd', 'ka': '\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8', 'sk': 'Sloven\u010dina', 'sl': 'sloven\u0161\u010dina', 'so': 'Soomaali', 'sq': 'shqip', 'ca': 'catal\u00e0', 'sr': '\u0441\u0440\u043f\u0441\u043a\u0438', 'kk': '\u049b\u0430\u0437\u0430\u049b \u0442\u0456\u043b\u0456', 'km': '\u1781\u17d2\u1798\u17c2\u179a', 'su': 'Sundanese', 'kn': '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1', 'sv': 'Svenska', 'ko': '\ud55c\uad6d\uc5b4', 'sw': 'Kiswahili', 'zh-TW': '\u7e41\u9ad4\u4e2d\u6587', 'ku': 'Kurdish', 'ta': '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd', 'ky': '\u043a\u044b\u0440\u0433\u044b\u0437\u0447\u0430', 'uzs': 'Southern Uzbek', 'cs': '\u010ce\u0161tina', 'te': '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41', 'tg': 'Tajik', 'th': '\u0e44\u0e17\u0e22', 'ti': '\u1275\u130d\u122d\u129b', 'la': 'Latin', 'cy': 'Cymraeg', 'tl': 'Filipino', 'da': 'Dansk', 'tr': 'T\u00fcrk\u00e7e', 'tt': 'Tatar', 'de': 'Deutsch', 'lo': '\u0ea5\u0eb2\u0ea7', 'lt': 'lietuvi\u0173', 'lv': 'latvie\u0161u', 'zh-CN': '\u7b80\u4f53\u4e2d\u6587', 'ug': '\u0626\u06c7\u064a\u063a\u06c7\u0631\u0686\u06d5', 'uk': '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430', 'dz': '\u0f62\u0fab\u0f7c\u0f44\u0f0b\u0f41', 'lis': 'Lisu', 'mg': 'Malagasy', 'mi': 'Maori', 'ur': '\u0627\u0631\u062f\u0648', 'mk': '\u043c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438', 'ml': '\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02', 'mn': '\u043c\u043e\u043d\u0433\u043e\u043b', 'mr': '\u092e\u0930\u093e\u0920\u0940', 'uz': 'o\u02bbzbekcha', 'ms': 'Bahasa Melayu', 'el': '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac', 'mt': 'Malti', 'en': 'English', 'eo': 'esperanto', 'chr': '\u13e3\u13b3\u13a9', 'my': '\u1017\u1019\u102c', 'es': 'Espa\u00f1ol', 'et': 'eesti', 'eu': 'euskara', 'vi': 'Ti\u1ebfng Vi\u1ec7t', 'nb': 'norsk', 'ne': '\u0928\u0947\u092a\u093e\u0932\u0940', 'fa': '\u0641\u0627\u0631\u0633\u06cc', 'nl': 'Nederlands', 'nn': 'nynorsk', 'no': 'norsk', 'fi': 'Suomi', 'mul': 'Multiple Languages', 'nv': 'Navajo', 'ny': 'Nyanja', 'fr': 'Fran\u00e7ais', 'rom': 'Romany', 'ga': 'Gaeilge', 'or': '\u0b13\u0b21\u0b3c\u0b3f\u0b06', 'gl': 'galego', 'pt-BR': 'Portugu\u00eas (Brasil)', 'gu': '\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0', 'xh': 'Xhosa', 'pa': '\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40', 'ckb': 'Central Kurdish', 'pl': 'polski', 'he': '\u05e2\u05d1\u05e8\u05d9\u05ea'};
window.LanguageDisplays.localNames = ['\u0142aci\u0144ski:la', '\u0142otewski:lv', 'afrikaans:af', 'alba\u0144ski:sq', 'amharski:am', 'angielski:en', 'arabski:ar', 'azerski:az', 'baskijski:eu', 'bengalski:bn', 'bia\u0142oruski:be', 'birma\u0144ski:my', 'bo\u015bniacki:bs', 'bu\u0142garski:bg', 'cebuano:ceb', 'chi\u0144ski (tradycyjne, Tajwan):zh-Hant', 'chi\u0144ski (tradycyjne):zh-TW', 'chi\u0144ski (uproszczone, Chiny):zh-Hans', 'chi\u0144ski (uproszczone):zh-CN', 'chorwacki:hr', 'cyga\u0144ski:rom', 'czeski:cs', 'czirokeski:chr', 'du\u0144ski:da', 'dzongkha:dz', 'esperanto:eo', 'esto\u0144ski:et', 'fi\u0144ski:fi', 'filipino:fil', 'filipino:tl', 'francuski:fr', 'galicyjski:gl', 'grecki:el', 'gruzi\u0144ski:ka', 'gud\u017aaracki:gu', 'haita\u0144ski:ht', 'hebrajski:he', 'hindi:hi', 'hiszpa\u0144ski:es', 'hmongijski:hmn', 'indonezyjski:id', 'inuktitut:iu', 'irlandzki:ga', 'islandzki:is', 'japo\u0144ski:ja', 'jawajski:jv', 'jawajski:jw', 'jidysz:yi', 'kannada:kn', 'kanto\u0144ski:zh-yue', 'katalo\u0144ski:ca', 'kazachski:kk', 'khmerski:km', 'khosa:xh', 'kirgiski:ky', 'korea\u0144ski:ko', 'kurdyjski:ku', 'laota\u0144ski:lo', 'Lisu:lis', 'litewski:lt', 'macedo\u0144ski:mk', 'malajalam:ml', 'malajski:ms', 'malgaski:mg', 'malta\u0144ski:mt', 'maoryjski:mi', 'marathi:mr', 'mongolski:mn', 'nawaho:nv', 'nepalski:ne', 'niderlandzki:nl', 'niemiecki:de', 'njand\u017ca:ny', 'norweski [nynorsk]:nn', 'norweski:nb', 'norweski:no', 'orija:or', 'ormia\u0144ski:hy', 'paszto:ps', 'pend\u017cabski:pa', 'perski:fa', 'polski:pl', 'portugalski (Brazylia):pt-BR', 'portugalski (Portugalia):pt-PT', 'rosyjski:ru', 'rumu\u0144ski:ro', 's\u0142owacki:sk', 's\u0142owe\u0144ski:sl', 'sanskryt:sa', 'seneka:see', 'serbski:sr', 'somalijski:so', 'sorani:ckb', 'Southern Uzbek:uzs', 'suahili:sw', 'sundajski:su', 'syngaleski:si', 'szwedzki:sv', 'tad\u017cycki:tg', 'tajski:th', 'tamilski:ta', 'tatarski:tt', 'telugu:te', 'tigrinia:ti', 'turecki:tr', 'ujgurski:ug', 'ukrai\u0144ski:uk', 'urdu:ur', 'uzbecki:uz', 'w\u0119gierski:hu', 'w\u0142oski:it', 'walijski:cy', 'wiele j\u0119zyk\u00f3w:mul', 'wietnamski:vi', 'zulu:zu'];