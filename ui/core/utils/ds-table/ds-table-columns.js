function DsTableColumns(dsTable) {
    "use strict";

    this.calculated = false;
    this.maxWidth = 0;
    var thScroll = null;
    this.thSelectable = null; // komórka zawierająca checkboxa
    this.thSortable = null; // komórka zawierająca 'uchwyt' do sortowania D&D
    this.offset = 0; // stałe przesunięcie rozmiarów kolumn, wymagane gdy dojdą 
    //kolumny o stałych rozmiarach, np kolumna z checkboxami 
    this.list = [];
    this.resizing = false;
    this.resizeMode = null;

    this.createResizer = (tr) => {
        var tolerance = 8;

        var startPos;
        var startCssWidth;
        var column;

        dsTable.tbody.addEventListener("scroll", (e) => {
            dsTable.theadTr.style.marginLeft = (-dsTable.tbody.scrollLeft) + "px";
        });

        dsTable.tblTag.on("mousedown", (e) => {
            this.resizing = column ? true : false;
            startPos = this.resizing ? e.clientX : null;
            startCssWidth = column ? column.cssWidth : null;
            if (column)
                column.resizing = false;
        });

        dsTable.tblTag.on("mousemove", (e) => {

            if (this.resizing) {
                column.resizing = true;
                console.log(this.resizeMode);
                var pos = e.clientX;

                var total = 0;
                tr.children.forEach((t) => {
                    total += t.offsetWidth;
                });

                var diff = 100 * (startPos - pos) / total;

                column.cssWidth = startCssWidth + (diff * -1);
                console.log('cssWidth: ' + column.cssWidth + '  startCssWidth: ' + startCssWidth + '  (diff * -1): ' + (diff * -1))

                //    document.title = "diff " + diff;
                this.applyCssWidths();
                return;
            }

            //sprawdzanie czy element jest th table cell, dla td pobiera th nagłówka
            var th = e.target instanceof HTMLTableCellElement ?
                    e.target.dsColumn ? e.target : e.target.dsCell
                    ? e.target.dsCell.column.th : null : null;

            if (th && e.layerX < tolerance)
                th = th.previousSibling;

            if (!th || !th.dsColumn) {
                if (!this.resizing) {
                    dsTable.tblTag.style.cursor = null;
                    this.resizeMode = false;

                    if (column)
                        column.resizing = false;
                    column = null;
                }
                return;
            }

            dsTable.tblTag.style.cursor = null;
            this.resizeMode = false;
            var col = th.dsColumn;
            if (column)
                column.resizing = false;
            column = null;

            if (e.layerX < tolerance || e.layerX > e.target.clientWidth - tolerance) {
                column = col;
                dsTable.tblTag.style.cursor = "col-resize";
                this.resizeMode = true;
            }

        });

        document.on("mouseup", (e) => {
            this.resizing = false;
            if (column)
                column.resizing = false;

        });

    };

    this.columns = [];


    // zwraca tablicę zawierającą widoczne kolumny  
    this.getVisible = () => {
        var result = [];
        dsTable.columns.list.forEach(col => {
            if (col.isVisible())
                result.push(col);
        });
        return result;
    };


    this.resize = () => {

        this.maxWidth = 0;
        var total = 0; // suma średnich
        var tblWidth = dsTable.tblTag.clientWidth;
        this.offset = 0;

        if (this.thSortable)
            this.offset += this.thSortable.offsetWidth;

        if (this.thSelectable)
            this.offset += this.thSelectable.offsetWidth;

        var columns = this.getVisible();

        function print() {
            var arr1 = [];
            var arr2 = [];
            var t1 = 0;
            var t2 = 0;
            columns.forEach(col => {
                arr1.push(Math.round(col.cssWidth));
                arr2.push(Math.round(col.cssMinWidth));
                t1 += col.cssWidth;
                t2 += col.cssMinWidth;
            });

            console.log(Math.round(t1) + "% -> [" + arr1.join(", ") + "]");
            console.log(Math.round(t2) + "px -> [" + arr2.join(", ") + "]");
        }


        var totalMinWidth = 0;
        // określ minimalną szerokość w pikselach

        var cnt = columns.length;
        if (cnt > 7)
            cnt = 7;

        cnt *= 1.5;

        columns.forEach(col => {
            col.calc();
            this.maxWidth += col.max;

            var width = col.max;

            var thWidth = col.th.clientWidth;

            if (thWidth > width)
                width = thWidth < 2 * width ? thWidth : 2 * width;

            if (width > tblWidth / cnt)
                width = tblWidth / cnt;

            const padding = 8;
            width += padding;

            col.cssMinWidth = width;
            totalMinWidth += col.cssMinWidth;
            /*
             var min = minW / tblWidth * 100;
             var max = maxW / tblWidth * 100;
             
             
             var maxLimit = 100 / columns.length + 20 - columns.length;
             
             if (min > maxLimit)
             min = maxLimit;
             if (max > maxLimit)
             max = maxLimit;
             
             var val = min;
             
             //            if (val > maxLimit)
             //                val = maxLimit;
             
             col.cssWidth = val;
             total += col.cssWidth;
             
             
             
             
             var cnt = columns.length;
             if (cnt > 7)
             cnt = 7;
             */

        });

        // określ szerokość procentową na podstawie minimalnej
        total = 0;
        columns.forEach(col => {
            col.cssWidth = 100 * col.cssMinWidth / totalMinWidth;
            total += col.cssWidth;
        });
        this.calculated = true;

        print();

        this.onWindowResize();
        this.applyCssWidths();
    };



// zastosuj wartości (css width)
    this.applyCssWidths = () => {
        var offs;
        var columns = this.getVisible();

        if (this.offset > 0)
            offs = this.offset / columns.length;

        columns.forEach(col => {
            col.getTags(true).forEach(tag => {
                tag.style.width = offs
                        ? `calc(${col.cssWidth}% - ${offs}px`
                        : col.cssWidth + "%";
                tag.style.width = tag.style.width || '1%';

                tag.style.minWidth = col.resizing
                        ? "30px"
                        : col.cssMinWidth ? col.cssMinWidth + "px" : null;

//                console.log('Width: ' + tag.style.width + '   min: ' + tag.style.minWidth)
            });
        });
    };

    this.addColumns = () => {

        if (dsTable.sortable)
            this.thSortable = dsTable.theadTr.tag("th")
                    .cls("th-sortable")
                    .tag("span")
                    .cls("fa fa-grip")
                    .parentNode;


        if (dsTable.selectable)
            this.thSelectable = dsTable.theadTr.tag("th")
                    .cls("th-selectable")
                    .tag("span")
                    .cls("fa fa-check-square-o")
                    .parentNode;

        dsTable.addColumns(dsTable.theadTr);
        thScroll = $tag("th").cls("th-scroll");
        thScroll.innerHTML = "&nbsp;";
    };

    this.onWindowResize = (e) => {
        if (!thScroll || !dsTable.rows.rowsPerPage)
            return;

        var diff = dsTable.tbody.offsetWidth - dsTable.tbody.clientWidth - 2;
        dsTable.tblTag.setAttribute("scroll-y", diff !== 0);
        dsTable.theadTr.style.paddingRight = diff + "px";

        if (diff > 2 && !thScroll.parentNode)
            dsTable.theadTr.appendChild(thScroll);

        if (diff <= 2 && thScroll.parentNode === dsTable.theadTr)
            dsTable.theadTr.removeChild(thScroll);

        thScroll.style.width = (diff + 2) + "px";
    };

    this.getColumnByName = function (name) {
        if (!name)
            return;
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].name === name)
                return this.list[i];

        }
    }

    Object.preventExtensions(this);
}


