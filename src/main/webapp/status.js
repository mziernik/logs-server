

var Status = function () {
    "use strict";

    var expanded = [];


    var exp = localStorage.getItem("status-expanded");
    if (exp)
        expanded = JSON.parse(exp);


    this.add = function (data) {
        if (logs.filters.paused)
            return;

        if (typeof data === 'string')
            data = JSON.parse(data);

        var sts = $id("statuses");
        sts.innerHTML = "";

        function visit(data, ul, level, path) {

            ul.style.paddingLeft = (15 * level) + "px";
            var exp = level < 1 || expanded.contains(data.path);


            if (!exp)
                ul.style.display = "none";

            if (data.hdr) {
                data.hdr.attr("expanded", exp);
                data.hdr.style.color = "#ffb";
            }

            for (var key in data.children) {
                var item = data.children[key];
                item.key = key;
                item.path = key ? (path ? path + "." : "") + key : null;

                var li = ul.tag("li");

                var hdr = item.hdr = li.tag("div");
                hdr.item = item;
                hdr.cls("sts-hdr");

                hdr.tag("span")
                        .cls("sts-cap")
                        .txt(item.cap);

                if (item.val !== null) {
                    hdr.tag("span").cls("sts-val-pre").txt(":");

                    hdr.tag("span")
                            .cls("sts-val")
                            .txt(item.val);
                }

                if (item.com)
                    hdr.tag("span")
                            .cls("sts-com")
                            .txt(item.com);

                if (!item.children || Object.keys(item.children).length === 0)
                    continue;

                visit(item, li.tag("ul"), level + 1, item.path);

                hdr.onclick = function (e) {
                    var item = e.currentTarget.item;

                    var tag = e.currentTarget.nextSibling;
                    if (tag.style.display === "none")
                        expanded.push(item.path);
                    else
                        expanded.remove(item.path);

                    localStorage.setItem("status-expanded", JSON.stringify(expanded));

                    $(tag).slideToggle(200);
                };

            }



        }

        visit(data, sts.tag("ul"), 0, "");

    };

};


window.statuses = new Status();

