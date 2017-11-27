"use strict";

/* global $id */

var Filters = function (logs) {
    var console = logs.console;
    var self = this;
    self.searchPhrase;
    var minDate;
    var maxDate;
    this.paused = false;

    //======================== wczytwanie konfiguacji ==========================
    var config = localStorage.getItem("logs_console_filters");
    config = config ? JSON.parse(config) : {};

    //============================ definicje grup ==============================
    var groups = this.groups = {
        date: new FilterGroup("$dte", "Data"),
        kind: new FilterGroup("knd", "Rodzaj"),
        application: new FilterGroup("app", "Aplikacja"),
        tag: new FilterGroup("tag", "Tag"),
        context: new FilterGroup("ctx", "Kontekst"),
        address: new FilterGroup("adr", "Adres"),
        device: new FilterGroup("dev", "Urządzenie"),
        os: new FilterGroup("os", "System"),
        ua: new FilterGroup("ua", "UserAgent"),
        host: new FilterGroup("hst", "Host"),
        user: new FilterGroup("usr", "Użytkownik"),
        version: new FilterGroup("ver", "Wersja"),
        instance: new FilterGroup("ist", "Instancja"),
        mode: new FilterGroup("mde", "Tryb"),
        lang: new FilterGroup("lcl", "Język")
    };

    groups.date.checkboxes = false;


    //=============== dodatkowe elementy: przyciski, pola edycyjne =============
    var fbuttons = $id("filters").tag("div").cls("f-buttons");

    fbuttons
            .tag("span")
            .txt("Wyczyść")
            .onclick = function () {
                $.each(logs.all, function (index, log) {
                    log.visible = false;
                });
                self.filterAll(false);
            };

    fbuttons.tag("span")
            .txt("Pauza")
            .onclick = function (e) {
                self.paused = !self.paused;
                e.target.txt(self.paused ? "Wznów" : "Pauza");
                e.target.css({
                    backgroundColor: self.paused ? "#eab700" : null,
                    color: self.paused ? "#000" : null
                });
                if (!self.paused)
                    self.filterAll(false);
            };

    // -------------------------- pole szukaj ----------------------------------
    var tag = $id("filters").tag("div").cls("f-search");

    tag.tag("div")
            .tag("input")
            .attr({
                placeholder: "szukaj",
                type: "text"
            })
            .onkeydown = function (e) {
                switch (e.keyCode) {
                    case 13:
                        var s = e.target.value.toLowerCase();


                        if (s.length > 0 && s.trim().length <= 2) {
                            e.target.style.backgroundColor = "red";
                            return;
                        }

                        if (s.length === 0)
                            $(console).removeHighlight();

                        e.target.style.backgroundColor = "#000";
                        self.searchPhrase = s;
                        self.filterAll(true);
                        break;

                    case 27:
                        self.searchPhrase = e.target.value = null;
                        e.target.style.backgroundColor = "#000";
                        $(console).removeHighlight();
                        self.filterAll(true);
                        break;
                }
            };




    // ---------------------- tworzenie struktury tagów grup -------------------

    $.each(groups, function (idx, group) {

        var cfg = config[group.key] || {};
        group.expanded = cfg.exp ? true : false;
        if (cfg.def !== undefined)
            group.defState = cfg.def;

        group.mainTag = $id("filters").tag("div").cls("fgroup");
        group.headerTag = group.mainTag.tag("div")
                .cls("fheader");

        group.headerTag.tag("span")
                .cls("fheader-caption")
                .txt(group.caption);


        group.headerFactorTag = group.headerTag.tag("span")
                .cls("fheader-factor");


        group.ul = group.mainTag.tag("ul");
        group.ul.style.display = group.expanded ? "block" : "none";
        group.mainTag.style.display = this.checkboxes ? "none" : "block";

        group.headerTag.onclick = function (e) {
            group.expand(null);
        };

        $.each(cfg.vals || {}, function (index, value) {
            if (!value || value.length !== 2)
                return;
            new FilterItem(group, index, value[0] ? true : false);
        });

    });

    groups.date.ul.tag("li")
            .tag("input")
            .cls("fdate")
            .attr({placeholder: "yyyy-mm-dd hh:mm:ss"})
            .onkeydown = function (e) {
                switch (e.keyCode) {
                    case 13:
                        minDate = Date.parse(e.target.value);
                        if (maxDate < minDate) {
                            var a = maxDate;
                            maxDate = minDate;
                            minDate = a;
                        }
                        self.filterAll(true);
                        break;

                    case 27:
                        e.target.value = null;
                        minDate = null;
                        self.filterAll(true);
                        break;
                }
            };

    groups.date.ul.tag("li")
            .tag("input")
            .cls("fdate")
            .attr({placeholder: "yyyy-mm-dd hh:mm:ss"})
            .onkeydown = function (e) {
                switch (e.keyCode) {
                    case 13:
                        maxDate = Date.parse(e.target.value);

                        if (maxDate < minDate) {
                            var a = maxDate;
                            maxDate = minDate;
                            minDate = a;
                        }

                        self.filterAll(true);
                        break;

                    case 27:
                        e.target.value = null;
                        maxDate = null;
                        self.filterAll(true);
                        break;
                }
            };

    this.filterAll = function (forced) {
        var visibleCount = 0;


        if (forced)
            $.each(groups, function (idx, group) {
                group.rejected = 0;
                group.processed = 0;
            });

        for (var i = logs.all.length - 1; i >= 0; i--) {
            var log = logs.all[i];

            if (visibleCount >= logs.DISPLAY_LIMT) {
                log.visible = false;
                continue;
            }

            if (forced || log.visible === undefined || log.visible === null) {
                log.visible = processLog(log);
                if (log.visible)
                    log.build();
            }

            if (log.visible)
                ++visibleCount;
        }

        $.each(groups, function (idx, group) {
            if (group.processed === 0)
                return;
            var f = Math.round(100 * (group.processed - group.rejected) / group.processed);

            group.headerFactorTag.style.display = f < 100 ? "inline" : "none";
            group.headerFactorTag.setText(f + "%");
        });

        logs.changeVisibility();
        if (self.searchPhrase)
            $(console).highlight(self.searchPhrase);
    };

    this.onNewLog = function (log) {
        // dodaj nowy log do filtrów
        $.each(groups, function (idx, group) {
            group.add(log.log[group.key]);
        });
    };


    function processLog(log) {

        var pairs = [];

        $.each(groups, function (idx, group) {
            if (!group.checkboxes)
                return;

            var value = log.log[group.key];

            if (value instanceof Array)
                value.forEach(function (val) {
                    pairs.push([group, val]);
                });
            else
                pairs.push([group, value]);
        });



        for (var i = 0; i < pairs.length; i++) {
            var group = pairs[i][0];

            var value = group.format(pairs[i][1]);
            ++group.processed;

            var item = group.items[value];
            if ((item && item.checked === false)
                    || (!item && group.defState === false)) {
                ++group.rejected;
                return false;
            }
        }

        if (minDate || maxDate) {

            var date = Date.parse(log.log.dte);

            if (minDate && date < minDate)
                return false;

            if (minDate && date > maxDate)
                return false;
        }

        if (self.searchPhrase && self.searchPhrase.trim()) {
            var has = false;

            var visit = function (element) {
                if (typeof element === "string" || typeof element === "number")
                    has |= element.toString().toLowerCase().search(self.searchPhrase) >= 0;

                if (typeof element === "object")
                    $.each(element, function (i, it) {
                        visit(it);
                    });
            };
            visit(log.log);
            if (!has)
                return false;
        }

        return true;
    }

    //==========================================================================

    function FilterGroup(key, caption) {
        this.key = key;
        this.caption = caption;
        this.mainTag = null;
        this.headerTag = null;
        this.headerFactorTag = null;
        this.ul = null;
        this.visible = false;
        this.items = {};
        this.expanded = false; // czy sekcja jest rozwinięta
        this.defState = true; // domyślny stan nowych checkboxów
        this.cfg; // sekcja konfiguracji
        this.checkboxes = true; // czy zawiera checkboxy
        this.multiple = key === "tag" || key === "adr";
        this.rejected = 0; // ilość logów odrzuconych podczas filtrowania
        this.processed = 0; // ilość przetworzonych logów
        var filter = this;
        var self = this;


        this.format = function (val) {
            if (val === null || val === undefined)
                val = "";

            if (this === groups.address && (val.split(":").length === 2 || val.split(":").length === 9))
                val = val.substring(0, val.lastIndexOf(":"));

            val = val.trim();
            if (val === "")
                val = "<brak>";

            return val;
        };

        this.add = function (val) {
            if (!this.checkboxes)
                return;

            if (!val)
                val = "";

            var filter = this;
            if (val instanceof Array) {
                val.forEach(function (v) {
                    filter.add(v);
                });
                return;
            }

            val = this.format(val);
            var item = this.items[val];
            if (!item) {
                item = new FilterItem(this, val);

                var elements = [];

                $.each(filter.items, function (idx, item) {
                    elements.push(item.tagLi);
                });

                if (elements.length > 1) {

                    elements.sort(function (a, b) {
                        return a.textContent.localeCompare(b.textContent);
                    });

                    elements.forEach(function (item) {
                        item.remove();
                        filter.ul.appendChild(item);
                    });
                }

            }
            this.visible = Object.keys(this.items).length >= 2;
            this.expanded &= this.visible; // jeśli grupa nie jest widoczna to traktuj jako zwiniętą
            this.mainTag.style.display = this.visible || !this.checkboxes
                    ? "block"
                    : "none";
            item.inc();
        };

        this.expand = function (state) {
            if (state === null || state === undefined)
                state = !self.expanded;


            if (state === self.expanded)
                return;

            $(this.ul).slideToggle(200, function () {
                self.expanded = $(this).is(":visible");
                saveState();
            });
        };

    }

    //==========================================================================

    function FilterItem(group, value, checked) {
        group.items[value] = this;
        this.group = group;
        this.value = value;
        this.count = 0;
        this.tagLabel;
        this.tagIco;
        this.tagCounter;
        this.tagLi;

        var item = this;

        this.checked = checked !== undefined ? checked : group.defState;
        this.refresh = function () {

            this.tagLi.attr({checked: item.checked});
            this.tagIco.ico.cls("fa "
                    + (this.checked === true ?
                            "fa-check" : this.checked === false
                            ? "fa-remove" : ""
                            ) + " fa-stack-1x");

            var changed = false;
            $.each(this.group.items, function (idx, item) {
                changed |= item.checked === false;
            });

            if (changed)
                this.group.headerTag.setAttribute("changed", "changed");
            else
                this.group.headerTag.removeAttribute("changed");
        };

        var li = this.tagLi = group.ul.tag("li");

        this.tagIco = li.tag("span").cls("fa-stack fa-lg");
        this.tagIco.tag("span").cls("fa fa-square fa-stack-2x");
        this.tagIco.ico = this.tagIco.tag("span");
        this.refresh();
        this.tagLabel = li.tag("span").setText(value);
        this.tagCounter = li.tag("span");
        this.inc = function () {
            ++this.count;
            this.tagCounter.setText("[" + this.count + "]");
        };

        li.onclick = function (e) {
            if (group.multiple) {
                group.defState = null;
                item.checked = item.checked === true
                        ? false : item.checked === false
                        ? null : true;
            } else {
                item.checked = !item.checked;
                var checked = 0;
                // szcowanie czy więcej jest elementów zaznaocznych czy odznaczonych
                // zapamiętywane są tylko tek, których jest mniej
                $.each(group.items, function (index, item) {
                    checked += item.checked === true
                            ? 1 : item.checked === false
                            ? -1 : 0;
                });

                group.defState = checked > 0; // domyślny stan nowych elementów
            }
            item.refresh();
            self.filterAll(true);
            saveState();
        };
    }

    //==========================================================================

    var saveStateTimeout;
    function saveState(force) {
        clearTimeout(saveStateTimeout);
        if (!force) {
            saveStateTimeout = setTimeout(saveState, 300, true);
            return;
        }


        // data prezentowana jako ilośćć sekund, która upłynęła od 2016-01-01
        var now = Math.round((new Date().getTime()
                - new Date("2016-01-01 00:00:00.000").getTime()) / 1000);


        var config = {};

        $.each(groups, function (index, group) {
            var cfg = config[group.key] = {};
            cfg.exp = group.expanded;
            if (!group.checkboxes)
                return;

            cfg.def = group.defState;
            cfg.vals = {};

            $.each(group.items, function (index, item) {
                delete(cfg.vals[item.value]);
                if (group.defState !== null && group.defState ^ item.checked) {
                    if (item.checked === null || item.checked === undefined)
                        return;

                    var arr = cfg.vals[item.value] = [];
                    arr.push(item.checked ? 1 : 0);
                    arr.push(now);
                }
            });

        });

        localStorage.setItem("logs_console_filters", JSON.stringify(config));

//             alert(JSON.stringify(config, "", "    "));

    }

};

export default Filters;