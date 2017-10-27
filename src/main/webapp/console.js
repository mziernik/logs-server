Date.prototype.formatMS = function () {
    "use strict";

    const f = (number) => (number < 10 ? "0" : "") + number;

    let ms = this.getMilliseconds().toString();
    while (ms.length < 3) ms = "0" + ms;

    return f(this.getFullYear())
        + "-" + f(this.getMonth() + 1)
        + "-" + f(this.getDate())
        + " " + f(this.getHours())
        + ":" + f(this.getMinutes())
        + ":" + f(this.getSeconds())
        + "." + ms;

};

function asArray(object) {
    "use strict";
    return object instanceof Array ? object : [object];
}

var Logs = function () {
    "use strict";

    this.TOTAL_LIMIT = 10000; //10000;
    this.DISPLAY_LIMT = 500; // 500;
    var console = this.console = $id("console");
    var filters = this.filters = new Filters(this);
    this.all = []; // lista wszystkich logów (TLog[])
    var statusBar = this.statusBar = $id("statusbar");


    var addQueue = [];
    var addTimeout;
    this.processedLogs = 0;

    this.add = function (logs) {

        var self = window.logs;

        if (!logs)
            return;

        self.busy(true);

        if (typeof logs === "string")
            logs = JSON.parse(logs);

        if (logs instanceof Array)
            addQueue = addQueue.concat(logs);
        else
            addQueue.push(logs);

        clearTimeout(addTimeout);
        addTimeout = setTimeout(function () {

            try {
                self.busy(true);

                addQueue.forEach(function (src) {
                    var log = new TLog(src);
                    self.all.push(log);
                    filters.onNewLog(log);
                });

                addQueue = [];

                var overflow = self.all.length - self.TOTAL_LIMIT;
                if (overflow > 0)
                    self.all.splice(0, overflow);

                if (!filters.paused)
                    filters.filterAll(false);
                else
                    statusBar.txt("Widocznych logów: " + console.children.length
                        + ",  Łącznie: " + self.all.length + ", przetworzono: "
                        + self.processedLogs);

            } finally {
                self.busy(false);
            }

        });

    };


    var TLog = function (log) {
        this.log = log;
        var self = this;
        this.visible = null; // true/false/null

        this.tmain = document.createElement("li");
        this.tmain.log = this;

        this.build = function (li) {
            var _export = li && li !== this.tmain;
            li = li || this.tmain;

            var now = new Date().toISOString().split('T')[0];

            if (li.children.length > 0)
                return true;


            if (log.knd)
                li.cls("lk-" + log.knd.toLowerCase());

            var div = li.tag("div")
                .cls("log-line");

            if (log.fcl)
                div.style.color = log.fcl;

            if (log.bcl)
                div.style.backgroundColor = log.bcl;

            div.tag("span")
                .cls("log-line-id")
                .txt(log.cnt + ".");

            var date = new Date(log.dte).formatMS();
            const dateFull = date;

            if (!_export && date.indexOf(now) === 0)
                date = date.substring(now.length).trim();

            div.tag("span")
                .cls("log-line-date")
                .attr({title: _export ? undefined : dateFull})
                .txt(date);

            var stag = div.tag("span");

            if (log.ctx)
                stag.cls("log-line-tags").txt("[" + asArray(log.ctx).join(", ") + "]");

            var tag = div.tag("span").cls("log-line-value");
            if (log.val) {
                var val = log.val;
                if (!val)
                    val = "";
                if (val.length > 150)
                    val = val.substring(0, 150).trim() + " […]";
                val = val.replaceAll("\n", " ↵ ");
                tag.txt(val)
                    .attr({title: _export ? undefined : log.val[2]});
            }

            // komentarz
            if (log.com) {
                div.tag("span").cls("log-line-comment")
                    .txt(log.com)
                    .attr({title: _export ? undefined : log.com});
            }

            if (_export) {

                div.attr("onclick", "showDetails(this)");

            }

            li.oncontextmenu = showPopupMenu;

            div.onclick = function (e) {
                var div = e.currentTarget.nextSibling;

                if (div.children.length === 0)
                    self.buildDetails(div);

                $(div).slideToggle(200, function () {
                    if ($(this).is(":visible"))
                        $(li).attr("expanded", true);
                    else
                        $(li).removeAttr("expanded");

                    if (filters.searchPhrase)
                        $('#console').highlight(filters.searchPhrase);

                });
            };


            //-----------------------

            var div = li.tag("div");
            div.cls("log-details");
            if (_export)
                this.buildDetails(div);

        };

        this.buildDetails = function (div) {
            var log = this.log;

            function arg(name, value) {
                if (!value)
                    return;

                var tr = tbl.tag("tr");

                if (!name) {
                    tr.tag("td").attr({colspan: 2}).txt(value);
                    return;
                }

                tr.tag("td").txt(name + ":");
                tr.tag("td").txt(value instanceof Array ? value.join(", ") : value);
            }

            function data(name, value) {
                if (!name && !value)
                    return;

                var tag = div.tag("div").cls("log-details-data");

                tag.tag("div")
                    .txt(name)
                    .onclick = function (e) {
                    $(e.currentTarget.nextSibling)
                        .slideToggle(200);
                };

                if (value)
                    tag.tag("pre").txt(value);

                return tag;
            }

            function stack(name, err, value) {
                if (!value)
                    return;
                var ul = data(name, null).tag("ul");

                if (err)
                    ul.cls("log-details-data-error-stack");
                else
                    ul.cls("log-details-data-call-stack")
                        .css({display: "none"});

                value.forEach(function (s) {
                    var li = ul.tag("li");

                    if (s === "--") {
                        li.tag("hr");
                        return;
                    }

                    var own = s.indexOf("*") === 0;
                    var fra = s.indexOf("+") === 0;
                    if (own || fra) {
                        s = s.substring(1);
                        li.setAttribute(own ? "own" : "fra", true);
                        if (window.app) {
                            li.onclick = function () {
                                window.app.showSourceFile(s);
                            };
                            li.setAttribute("src-file", true);
                        }
                    }
                    li.txt(s);


                });
                return ul;
            }

            var tbl = data("Atrybuty", null).tag("div").css({display: "none"}).tag("table").tag("tbody");

            arg("Data", new Date(log.dte).formatMS());
            arg("Rodzaj", log.knd);

            arg("Aplikacja", log.app);
            arg("Wersja", log.ver);
            arg("Czas działania", log.upt);
            arg("Język", log.lcl);
            arg("Adres", log.adr);
            arg("System operacyjny", log.os);
            arg("Urządzenie", log.dev);
            arg("Host", log.hst);
            arg("User Agent", log.ua);
            arg("Użytkownik", log.usr);

            arg("Instancja", log.ist);
            arg("Żądanie", log.req);
            arg("Sesja", log.ses);
            arg("URL", log.url);

            arg("Metoda", log.mth);
            arg("Klasa", log.cls);
            arg("Tryb", log.mde);

            arg("Id procesu", log.prc);
            arg("Wątek", log.thr + ", " + log.thp + ", " + log.thn);

            arg("logger", log.lgr);
            arg("UID", log.uid);
            arg("Komentarz", log.com);

            arg("Licznik", log.cnt);
            arg("Klucze", log.key);

            arg("Kolor", log.fcl);
            arg("Tło", log.bcl);

            arg("Tag", log.tag);

            //-----------------
            if (log.atr) {

                var defTable = tbl;

                const attrs = {};

                asArray(log.atr).forEach(attr => {
                    attr = asArray(attr);

                    let group = "";
                    let name = "";
                    let value = "";

                    switch (attr.length) {
                        case 3:
                            group = attr[0];
                            name = attr[1];
                            value = attr[2];
                            break;
                        case 2:
                            name = attr[0];
                            value = attr[1];
                            break;
                        case 1:
                            value = attr[0];
                            break;
                    }

                    const a = attrs[group] || {};
                    a[name] = value;
                    attrs[group] = a;
                });

                for (var group in attrs) {
                    tbl = group ? data(group, null).tag("div").tag("table").tag("tbody") : defTable;
                    for (var name in attrs[group])
                        arg(name, attrs[group][name]);
                }
            }

            data("Wartość", log.val);

            if (log.dta)
                log.dta.forEach(function (dta) {
                    data(dta[1], dta);
                });

            stack("Stos błędów", true, log.est);
            stack("Stos wywołań", false, log.cst);
        };

        var showPopupMenu = function () {
            var pmMain = new PopupMenu();

            var byDate = function (older) {
                var input = filters.groups.date.mainTag
                    .getElementsByTagName("input")[older ? 0 : 1];
                filters.groups.date.expand(true);
                input.value = log.dte;
                input.onkeydown({
                    keyCode: 13,
                    srcElement: input
                });
            };

            pmMain.add("Pokaż starsze niż " + log.dte, function () {
                byDate(true);
            });

            pmMain.add("Pokaż młodsze niż " + log.dte, function () {
                byDate(false);
            });

            /*  var pmKind = pmMain.add("Rodzaj \"" + log.knd + "\"");
             pmKind.add("Pokaż wyłącznie");
             pmKind.add("Wyklucz");
             
             var pmSource = pmMain.add("Źródło \"" + log.src + "\"");
             
             
             pmSource.add("Pokaż wyłącznie");
             pmSource.add("Wyklucz");
             
             var pmSource = pmMain.add("Adres \"" + log.adr + "\"");
             var pmSource = pmMain.add("Użytkownik \"" + log.usr + "\"");
             
             var pmSave = pmMain.add("Zapisz do pliku");
             */

            pmMain.separator();
            pmMain.add("Zapisz do pliku", function () {
                saveToFile();
            });

            pmMain.show();
            return false; // onContext
        };
    };


    this.changeVisibility = function () {
        var preConsole = console.parentNode;
        var scrollToEnd = preConsole.scrollHeight - preConsole.scrollTop
            - preConsole.clientHeight <= 50;

        var list = [];
        $.each(this.all, function (index, log) {
            if (log.visible)
                list.push(log);
        });

        // ------------- usun zbedne elementy -------------
        var toRemove = [];

        $.each(console.children, function (index, tag) {
            if (list.indexOf(tag.log) < 0)
                toRemove.push(tag.log);
        });

        $.each(toRemove, function (index, log) {
            console.removeChild(log.tmain);
        });

        // ---------------------------------------

        var dst = console.children[0];

        while (dst) {
            var tag = list.splice(0, 1)[0].tmain;
            if (tag !== dst)
                console.insertBefore(tag, dst);
            else
                dst = dst.nextSibling;
        }


        // dodaj pozostale tagi
        $.each(list, function (index, log) {
            console.appendChild(log.tmain);
        });


        //console.appendChild(tag);

        logs.statusBar.txt("Widocznych logów: " + console.children.length
            + ",  Łącznie: " + this.all.length + ", przetworzono: "
            + logs.processedLogs);

        if (scrollToEnd)
            preConsole.scrollTop = preConsole.scrollHeight;

        //     document.title = "Logów: " + cnt + " / " + logs.length;
    };


    var busyTag; //tag ikony (div)

    this.busy = function (state) {

        if (!busyTag) {
            busyTag = document.body.tag("div")
                .cls("busy");
            new SVG(busyTag, 64, 64, "0 0 453.872 453.871")
                .tag("path")
                .attr("fill", "#666")
                .attr("fill-opacity", "0.6")
                .attr("d", "M369.822,42.794h17.744V0H66.305v42.794h17.746v11.105c0,69.716,23.859,133.656,63.155,171.591 "
                    + "c-39.296,37.942-63.155,101.877-63.155,171.596v13.992H66.305v42.793h321.261v-42.793h-17.744v-13.992 "
                    + "c0-69.719-23.863-133.653-63.154-171.596c39.291-37.935,63.154-101.864,63.154-171.591V42.794z M276.738,214.327l-14.735,11.163 "
                    + "l14.735,11.163c36.771,27.885,61.451,84.345,64.71,146.425H112.431c3.257-62.074,27.926-118.534,64.708-146.425l14.727-11.163 "
                    + "	l-14.727-11.163c-36.776-27.888-61.451-84.34-64.708-146.42h229.008C338.189,129.987,313.508,186.439,276.738,214.327z "
                    + "	 M141.955,90.167h169.96c-2.457,47.136-21.202,90.009-49.143,111.183c0,0-4.784,2.066-11.173,8.47 "
                    + "	c-13.218,18.876-13.923,87.873-13.945,90.915c9.49,1.013,19.743,5.018,29.904,14.299c35.85,32.755,46.252,36.618,47.503,60.396 "
                    + "	H146.965c1.25-23.772,21.646-40.785,47.5-60.396c0,0,12.3-10.795,29.552-13.79c-0.314-0.542-0.498-0.908-0.498-0.908 "
                    + "	c0-64.99-21.248-92.857-21.248-92.857l-15.103-8.47C159.236,177.821,144.42,137.304,141.955,90.167z"
                );
        }


        busyTag.style.opacity = state ? 1 : 0;
    };

    this.busy(true);


};


addEventListener("load", function () {

    window.logs = new Logs();

    var url = window.location.href.replace("http://", "ws://") + "console";

    const ws = new WebSocket(url);

    ws.onclose = function (code, reason, wasClear) {

    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.logs)
            window.logs.add(data.logs);
    };

    ws.onopen = function (event) {

    };
});


