
//ToDo: budowanie tagu powinno odbywać się w moemncie tworzenia obiektu

(function (window) {

    this.onClick = null;

    var PopupMenu = window.PopupMenu = function (data) {
        this.parent = null;
        this.tbase = null; // tag bazowy (div / tbl)
        this.caption;
        this.checked;
        this.icon;
        this.isSeparator;
        this.items = [];
        this.onClick;
        this.onChildrenClick;
        this.zIndex = 10;
        this.x;
        this.y;
        this.onBeforePopup;
        this.disabled = false; // todo
        this.id = null;
        this.data = null;

        data = this.data = Utils.coalesce(data, {});
        this.caption = data.caption;
        this.checked = data.checked;
        this.onClick = data.onClick;
        this.zIndex = Utils.coalesce(data.zIndex, 10);
        this.disabled = data.disabled;
        data.item = this;

        if (data.items)
            for (var name in data.items) {
                var item = data.items[name];
                var pmi = new PopupMenu(item);
                pmi.id = name;
                this.items.push(pmi);
            }



        this.add = function (caption, onClick) {
            var mi = new PopupMenu();
            mi.caption = caption;
            mi.onClick = onClick;
            mi.parent = this;
            this.items.push(mi);
            return mi;
        };

        this.separator = function () {
            var mi = new PopupMenu();
            mi.isSeparator = true;
            this.items.push(mi);
            return mi;
        };
    };


    PopupMenu.prototype.show = function (x, y) {
        if (this.tbase)
            this.hide(true);

        if (this.onBeforePopup)
            this.onBeforePopup(this);

        if (isNaN(x) || isNaN(y)) {
            x = popupMenuItemHandler.x + 2;
            y = popupMenuItemHandler.y;
        }

        //   app.Log.Debug("pm show: " + x + " x " + y);

        var t = $id("popup-menu-container");
        if (!t)
            t = document.body.tag("div").attr("id", "popup-menu-container");

        var tag = this.tbase = t.tag("div").cls("t-popup-menu pm-user");


        var tbl = this.tbase.tag("table");

        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].checked === true || this.items[i].checked === false) {
                tag.setAttribute("data-checkable", "true");
                break;
            }

            if (false) {
                tag.setAttribute("data-icons", "true");
                break;
            }
        }

        for (var i = 0; i < this.items.length; i++) {
            /** @type PopupMenu */
            var mi = this.items[i];

            var tr = tbl.tag("tr");
            tr.item = mi;
            tr.self = this;
            var td;

            if (mi.isSeparator) {
                tr.attr("separator", "true")
                        .tag("td")
                        .attr("colspan", 4).tag("hr");
                continue;
            }

            td = tr.tag("td"); // ikona
            td = tr.tag("td");
            if (mi.checked === true || mi.checked === false) {
                var cb = td.tag("input");
                cb.setAttribute("type", "checkbox");
                cb.checked = mi.checked;
            }

            tr.tag("td").txt(mi.caption);
            td = tr.tag("td");

            tr.addEventListener("mouseover", function (e) {
                var tr = e.currentTarget;

                // ukryj wszystkie widoczne podelementy
                for (var i = 0; i < tr.self.items.length; i++)
                    if (tr.self.items[i] !== tr.item)
                        tr.self.items[i].hide();

                if (tr.item.items.length === 0 || tr.item.tbase) // jesli jest juz wyswietlony
                    return;

                var items = tr.self;
                tr.item.show(items.x + tr.offsetWidth + 1, items.y + tr.offsetTop);

            });

            tr.addEventListener("click", function (e) {
                var self = e.currentTarget.self;
                var mi = e.currentTarget.item;
                mi.hide();
                setTimeout(function () {
                    if (mi.onClick)
                        mi.onClick(mi);
                    if (self.onChildrenClick)
                        self.onChildrenClick(mi);
                }, 100);
            });


            if (mi.items.length > 0) {

                var svg = new SVG(td, 10, 10, "0 0 128276 148120");
                svg.polygon("128028,74060 64076,37137 124,215 124,74060 124,147906 64076,110983 ");

                // td.text(">");

                /*
                 tr.addEventListener("mouseout", function(e) {
                 var tr = e.currentTarget;
                 clearTimeout(tr.timeout);
                 tr.timeout = setTimeout(function(tr) {
                 if (tr.item.tbase)
                 return;
                 var items = tr.self;
                 app.Log.Debug("mouseout: " + tr.item.caption);
                 tr.item.hide();
                 }, 100, tr);
                 }, true);*/
            }
        }


        // ------------- okresl szerokosc -----------------------------
        tbl.style.whiteSpace = "nowrap";
        var ww = tag.offsetWidth;
        tbl.style.whiteSpace = null;
        //----------------

        tag.style.maxHeight = (window.innerHeight - 8) + "px";


        if (x + ww > window.innerWidth - 24)
            x = window.innerWidth - 24 - ww;

        if (y + tag.offsetHeight > window.innerHeight - 4)
            y = window.innerHeight - 4 - tag.offsetHeight;



        setTimeout(function () {
            tag.style.opacity = "1";
        });


        popupMenuItemHandler.visible.push(this);


        this.x = x;
        this.y = y;

        tag.style.zIndex = this.zIndex;
        tag.style.left = x + "px";
        tag.style.top = y + "px";
        
        return false;
    };


    PopupMenu.prototype.hide = function () {
        var pm = this;

        // ukryj dzieci
        for (var i = 0; i < this.items.length; i++)
            this.items[i].hide();

        popupMenuItemHandler.visible.remove(pm);

        var tag = pm.tbase;
        if (!tag)
            return;


        tag.style.opacity = "0";

        setTimeout(function () {
            if (tag)
                tag.remove();

        }, 500);

        pm.tbase = null;
    };

    var popupMenuItemHandler = {
        x: 0,
        y: 0,
        visible: []
    };


    popupMenuItemHandler.onMouseDown = function (e) {
        var tag = e.target;
        if (tag.className === "t-popup-menu")
            return;

        popupMenuItemHandler.x = e.clientX;
        popupMenuItemHandler.y = e.clientY;



        for (var i = 0; i < popupMenuItemHandler.visible.length; i++)
            popupMenuItemHandler.visible[i].hide();


    };

    addEventListener("mousedown", popupMenuItemHandler.onMouseDown);


    /*
     addEventListener("load", function() {
     Utils.addFramesEventListener("mousedown", top.popupMenuItemHandler.onMouseDown);
     });
     */


})(window);





