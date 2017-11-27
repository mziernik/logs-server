/* global HTMLTableElement */

function DsTableColumn(dsTable, name, colData) {
    "use strict";

    if (colData.disabled)
        return;

    dsTable.columns.list.push(this);

    this.dsTable = dsTable;


    this.caption = colData.caption;
    this.subtitle = colData.subtitle;
    this.dateFormat = colData.dateFormat;
    this.disabled = Utils.coalesce(colData.disabled, false);
    this.editable = colData.editable;
    this.filtered = colData.filterable;
    this.hidden = Utils.coalesce(colData.hidden, false);
    this.nullable = colData.nullable;
    this.primaryKey = colData.primaryKey;
    this.searchable = Utils.coalesce(colData.searchable, true);
    this.sortOrder = colData.sortOrder;
    this.sortable = Utils.coalesce(colData.sortable, true);
    this.type = colData.type;
    this.unique = colData.unique;
    this.align = colData.align;

    this.table = dsTable;
    this.idx = dsTable.columns.list.length - 1;
    this.name = name;

    this.th = null;
    this.trTag = null;

    this.min = null;
    this.max = null;
    this.avg = null;
    this.med = null;

    this.cssWidth = null; // aktuala szerokość procentowa kolumny
    this.cssMinWidth = null; // minimalna szerokość w pikselach
    this.resizing = false; // trwa w tym mommencie zmiana rozmiaru kolumny

    this.sortOrder = null;
    var column = this;


    var pressed;

    // kopiowanie pól z [col] do [this]
    $.each(colData, (name, value) => {
        column[name] = value;
    });


    /* do dokonczenia (zmiana formatu daty)
     if (column.dateFormat) {
     dsTable.popupMenu.dateFormat.items[name] = {
     caption: col.caption,
     items: {}
     };
     
     $.each(column.dateFormat[1], function(idx, dateFormat) {
     dsTable.popupMenu.dateFormat.items[name].items[dateFormat] = {
     caption: dateFormat,
     checked: column.dateFormat[0] === dateFormat,
     onClick: function (item) {
     //bardziej by pasowaly radio buttony niz checkboxy tutaj
     $.each(dsTable.popupMenu.dateFormat.items[name].items, function (idx, item) {
     item.checked = false;
     });
     item.data.checked = true;
     }
     };
     });
     //            dsTable.popupMenu.dateFormat.items[name].items[column.dateFormat]
     }
     
     //        //domyslna funkcja sortowania to sortowanie jako string
     //        this.sortFunction = function (a, b) {
     //            return a[col.name].toString().localeCompare(b[col.name].toString()) * col.sortOrder;
     //        };
     */



    this.build = (tr) => {


        if (this.hidden)
            return;

        this.th = tr.tag("th");

        (this.caption || "").split("\n").forEach((s) => {
            this.th.tag("div", s);
        });

        (this.subtitle || "").split("\n").forEach((s) => {
            this.th.tag("div", s).cls("th-subtitle");
        });


        this.th.title = this.caption;
        this.th.dsColumn = this;

//        if (!dsTable.sortCol && this.primaryKey)
//            dsTable.sortCol = this;

        if (!this.sortable)
            return;

        this.th.onclick = (e) => {
            if (dsTable.columns.resizing || dsTable.columns.resizeMode)
                return;

            if (!this.sortable)
                return;

            if (this !== dsTable.sortCol) {
                if (dsTable.sortCol)
                    dsTable.sortCol.sortOrder = null;
                dsTable.sortCol = this;
            }
            this.sortOrder = this.sortOrder !== null ? this.sortOrder * -1 : 1;
            dsTable.rows.filter({sort: true});
        };
    };

    this.isVisible = () => {
        return !this.hidden && !this.disabled;
    };

    this.getTags = (includeTh) => {
        var result = [];
        if (includeTh && this.th)
            result.push(this.th);
        this.getCells(true).forEach(cell => {
            if (cell.tdTag)
                result.push(cell.tdTag);
        });
        return result;
    };

    this.getCells = (visibleOnly) => {
        var result = [];
        dsTable.rows.list.forEach((row) => {
            if (!row.visible)
                return;
            var cell = row.cells[this.name];
            if (cell && (!visibleOnly || this.isVisible()))
                result.push(cell);
        });
        return result;
    };

    // przelicz szerokości kolumn
    this.calc = () => {

        if (this.hidden)
            return;

        this.cssMinWidth = null;

        var sizes = [];
        this.getCells().forEach((cell) => {
            cell.initWidth = cell.tdTag.clientWidth;
            sizes.push(cell.initWidth);
        });


        sizes.sort();

        var min = 0xEFFFFF;
        var max = -1;
        var avg = 0;
        var med = 0;

        $.each(sizes, (idx, value) => {

            if (value < min)
                min = value;

            if (value > max)
                max = value;

            avg += value;
        });

        var count = sizes.length;

        avg /= count;

        med = Math.round(count / 2);
        if (count % 2 === 1)
            med = sizes[med];
        else
            med = (sizes[med - 1] + sizes[med]) / 2;

        this.min = min;
        this.max = max;
        this.avg = avg;
        this.med = med;
    };
    /*
     this.resizer = (columns, tolerance) => {
     var th = this.th;
     var cursorBetweenColumns = undefined;
     var initialCursor = $(th).css('cursor');
     
     th.onmousemove = (event) => {
     switch (this.idx) {
     case 0:
     cursorBetweenColumns = (this.clientWidth - event.offsetX) < tolerance;
     break;
     case columns.length - 1:
     cursorBetweenColumns = event.offsetX < tolerance;
     break;
     default:
     cursorBetweenColumns = event.offsetX < tolerance || (this.clientWidth - event.offsetX) < tolerance;
     }
     
     //wyswietlanie kursora resize
     th.css({cursor: cursorBetweenColumns ? 'col-resize' : initialCursor});
     };
     
     pressed = false;
     var adjacentTagSide = undefined;
     var startX, startWidth, adjacentTagStartWidth;
     
     
     th.onmousedown = (e) => {
     if (!cursorBetweenColumns)
     return;
     pressed = true;
     startX = e.pageX;
     startWidth = dsTable.autoFitWidth ? parseFloat(th.style.width.slice(0, -1)) : $(th).width();
     var adjTag = undefined;
     if ((e.currentTarget.clientWidth - e.offsetX) > tolerance) {
     adjacentTagSide = 'left';
     adjTag = dsTable.columns[this.idx - 1].tags[0];
     } else {
     adjacentTagSide = 'right';
     adjTag = dsTable.columns[this.idx + 1].tags[0];
     }
     adjacentTagStartWidth = dsTable.autoFitWidth ? parseFloat(adjTag.style.width.slice(0, -1)) : $(adjTag).width();
     };
     
     var onMouseMove = (e) => {
     if (!pressed)
     return;
     
     //                        var ctWidth = $(th).width();
     var ctWidth = undefined;
     var atWidth = undefined;
     var adjacentTag = undefined;
     var tableWidth = undefined;
     
     var distance = undefined;
     var adjacentTagIndex = undefined;
     
     if (adjacentTagSide === 'right') {
     distance = startX - e.pageX;
     adjacentTagIndex = this.idx + 1;
     //                    } else if (adjacentTagSide === 'left') {
     } else {
     distance = e.pageX - startX;
     adjacentTagIndex = this.idx - 1;
     }
     
     ctWidth = dsTable.autoFitWidth ? adjacentTagStartWidth + distance /
     $(dsTable.tblTag).width() * 100 : adjacentTagStartWidth + (distance);
     atWidth = dsTable.autoFitWidth ? startWidth - distance /
     $(dsTable.tblTag).width() * 100 : startWidth - distance;
     tableWidth = dsTable.tblTag.clientWidth;
     
     $.each(this.tags, (index, tag) => {
     adjacentTag = dsTable.columns[adjacentTagIndex].tags[index];
     if ((dsTable.autoFitWidth ? ctWidth / 100 * tableWidth : ctWidth) > 40
     && (dsTable.autoFitWidth ? atWidth / 100 * tableWidth : atWidth) > 40) {
     if (dsTable.autoFitWidth) {
     adjacentTag.style.width = ctWidth + '%';
     tag.style.width = atWidth + '%';
     } else {
     $(adjacentTag).width(ctWidth);
     $(tag).width(atWidth);
     }
     }
     });
     };
     $(document).bind('mousemove', onMouseMove);
     
     
     
     var onMouseUp = (e) => {
     if (pressed) {
     window.setTimeout(() => {
     pressed = false;
     }, 100);
     }
     };
     
     $(document).bind('mouseup', onMouseUp);
     
     };
     */

    Object.preventExtensions(this);
}

