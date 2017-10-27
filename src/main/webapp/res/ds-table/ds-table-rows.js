function DsTableRows(dsTable) {
    "use strict";

    this.label = null; // span, etykieta rezultatów wyszukiwania
    this.offset = 0;
    this.visibleCount = 0;
    this.pageCount = 0;
    this.results = 0; // ilość rezultatów po filtorowaniu
    this.pageCountLabel = null;
    this.currentPage = 0;
    this.list = [];

    this.rowsPerPage = null;

    var pageInput = null;
    var searchInput = null;
    var searchPhrase = null;

    var previousRowsPrePage;

    const rowHeight = 29;

    /**
     * Zwraca rzeczywistą ilość wierszy na stronę (tryb auto)
     * @returns {Number}
     */
    this.getRowsPerPage = () => {
        if (this.rowsPerPage === null)
            this.rowsPerPage = dsTable.loadPublicValue("rowsPerPage") || 0;

        if (this.rowsPerPage)
            return this.rowsPerPage;
        return Math.floor(dsTable.tbody.clientHeight / rowHeight);
    };

    this.setRowsPerPage = (value) => {
        this.rowsPerPage = value;
        dsTable.savePublicValue("rowsPerPage", this.rowsPerPage);
        this.filter({
            resize: false,
            reset: false
        });

    };

    /**
     * 
     * @param {Object} actions {
     *  {bolean} resize //przeliczenie szerokosć kolumn w stosunku do zawartości
     *  {bolean} sort //sortowanie
     *  {bolean} update //gdy odświeżenie danych, 
     *                    reset wyników wymuszenie ponownego przefiltrowania danych
     *  {bolean} reset //reset wyników filtrowania,skok do strony nr 1
     *  {bolean} windowResize// wywołanie eventu onWindowResize 
     *                          odpowiedzialnego za przeliczenie szerokosć kolumn
     *                          prawidłowe pokazanie scrolla
     *  }
     *  
     * @returns {undefined}
     */
    // filtrowanie wierszy po aktualizacji
    this.filter = (actions) => { //ToDo: rozbudować   

        if (dsTable.reloadRequestProcessing)
            return;

        actions = actions || {
            resize: false,
            sort: false,
            update: false,
            reset: false,
            windowResize: false
        };
        var forceSearch = false;//wymuszenie ponownego wyszukiwania

        // --------------------- akcje ----------------------------------

        if (actions.sort) {
            this.sortRowList();
            this.currentPage = 1;
        }
        if (actions.update) {//do przemysłenia czy update ma domyślnie wywoływac sortowanie;
            this.sortRowList();
            this.results = null;
            forceSearch = true;
        }
        if (actions.reset) {
            this.results = null;
            this.currentPage = 1;
            forceSearch = true;
        }


        this.results = this.results || this.list.length;

        // ----------------- wyszukiwanie frazy ----------------------------
        var phrase = searchInput.value.trim();

        if (forceSearch && (phrase || phrase !== "")
                || ((phrase || phrase === "") && phrase !== searchPhrase)) {

            searchPhrase = phrase;

            if (searchPhrase) {
                this.results = 0;
                dsTable.rows.list.forEach(row => {
                    row.disabled = !row.similarity.search(searchPhrase);
                    this.results += row.disabled ? 0 : 1;
                });
            }
            if (searchPhrase === "") {
                dsTable.rows.list.forEach(row => {
                    row.disabled = false;
                });
                this.results = this.list.length;
            }
        }

        this.pageCount = Math.ceil(this.results / this.getRowsPerPage());

        // --------------------------- paginacja ---------------------------------
        if (this.currentPage > this.pageCount)
            this.currentPage = this.pageCount;
        if (this.currentPage < 1)
            this.currentPage = 1;

        pageInput.attr('max', this.pageCount);
        pageInput.value = this.currentPage;
        this.offset = (this.currentPage - 1) * this.getRowsPerPage();

        this.visibleCount = 0;
        var cnt = 0;

        this.list.forEach((row) => {
            cnt += row.disabled ? 0 : 1;
            row.visible = !row.disabled
                    && cnt > this.offset
                    && this.visibleCount < this.getRowsPerPage();
            this.visibleCount += row.visible ? 1 : 0;
        });


        this.pageCountLabel.txt("/ " + this.pageCount);

        var min = this.offset + 1;
        var max = this.offset + this.visibleCount;

        this.label.innerText = this.visibleCount
                ? `Pozycje od ${min} do ${max} z ${this.results}`
                : 'Brak rezultatów';


        dsTable.redraw(actions.resize);

        if (actions.windowResize)
            dsTable.columns.onWindowResize();

    };

    this.nextPage = () => {

        if (dsTable.continuous || this.currentPage < this.pageCount)
            return this.setCurrentPage(this.currentPage + 1);
        return false;
    };

    this.prevPage = () => {
        if (this.currentPage > 1)
            return this.setCurrentPage(this.currentPage - 1);
        return false;
    };

    /**
     * 
     * @param {DsTableColumn} col, przekazanie parametru powoduje 
     * posortowanie po wybranej kolumnie, brak, posortuje po starej
     * zalecane wywoływane przez filter({sort:true});
     *
     * @returns {undefined}
     */
    this.sortRowList = (col) => {

        //FixMe

        col = col || dsTable.sortCol || dsTable.columns.getColumnByName(dsTable.loadPrivateValue('sortCol'));
        if (col)
            dsTable.savePrivateValue('sortCol', col.name)

        if (!col || !col.sortable)
            return;

        if (col.sortOrder === null)
            col.sortOrder = 1;

        dsTable.sortCol = col;

        let primaryKeyName = dsTable.primaryKeyColumn
                ? dsTable.primaryKeyColumn.name
                : null;

        this.list.sort(function (a, b) {
            let firstValue = a.cells[col.name].value;
            let secondValue = b.cells[col.name].value;

            var c, d, sortCond;
            switch (col.type) {
                case "length":
                case 'int':
                case 'double':
                    c = parseFloat(firstValue);
                    d = parseFloat(secondValue);
                    break;
                case 'date':
                    c = Utils.getTimestamp(firstValue, col.dateFormat[0]);
                    d = Utils.getTimestamp(secondValue, col.dateFormat[0]);
                    break;
                default://FixMe nie moze być na sztywno kolumna id, //primaryKeyColumn
                    var localeCompare = (firstValue || '').toString().localeCompare((secondValue || '').toString());
                    return localeCompare * col.sortOrder;
            }
            sortCond = c > d ? 1 : (c < d ? -1 : a.cells[primaryKeyName].value - b.cells[primaryKeyName].value);
            return col.sortOrder * sortCond;
        });
    };

    this.setCurrentPage = function (page = 1) {
        if (page < 1)
            page = 1;

        if (page > this.pageCount) {
            if (dsTable.continuous) {
                dsTable.reloadData({offset: dsTable.rows.results});//length
                this.currentPage = page;
                return true;
            } else
                page = this.pageCount;
        }

        if (this.currentPage === page)
            return false;

        this.currentPage = page;
        pageInput.value = this.currentPage;

        dsTable.tbody.scrollTop = 0;  // przescroluj na górę
        this.filter({windowResize: true});
        return true;
    };

    this.load = (dataSet, resize = true) => {

        Utils.checkInstance(dataSet, ["WebApiResponse", "Object", "Array"]);

        var rowsData;

        if (dataSet instanceof Array)
            rowsData = dataSet;
        else
        if (typeof dataSet === "object") {

            if (Utils.className(dataSet) === "WebApiResponse")
                dataSet = dataSet.data;

            if (!dataSet)
                return;

            if (dataSet.limit !== null) {
                dsTable.continuous = true;
                if (dsTable.rows.results) {

                    dsTable.updateData.update(dataSet.rows);
                    return;
                }
            }

            rowsData = dataSet.rows;
            dsTable.columns.list.clear();
            $.each(dataSet.columns, (name, colData) => {

                var col = new DsTableColumn(dsTable, name, colData);
                if (col.primaryKey)
                    dsTable.primaryKeyColumn = col;

            });

            dsTable.selectable = Utils.coalesce(dsTable.options.selectable, dataSet.selectable, false);
            dsTable.sortable = Utils.coalesce(dsTable.options.selectable, dataSet.sortable, false);
            dsTable.autoUpdate = Utils.coalesce(dsTable.options.autoUpdate, dataSet.updatable, true);
            dsTable.theadTr.clear();
            dsTable.columns.addColumns();
        }

        if (!rowsData)
            throw "Missing rows data";

        var hasRows = this.length > 0;


        this.list.clear();
        dsTable.tbody.clear();

        for (var i = 0; i < rowsData.length; i++)
            new DsTableRow(dsTable).update(rowsData[i]);

        if (!hasRows && rowsData.length > 0)
            dsTable.columns.calculated = false; // wymuszenie przeliczenia szerokości kolumn 

        this.filter({resize: true, update: true});

        dsTable.dataSet = this.unnest(rowsData);
        dsTable.onDataLoaded(dsTable.dataSet);
    };

    this.buildFooter = (container) => {
        // -------------- paginacja --------------------

        var tpagination = container.tag("span");

        var btnFirst = tpagination.tag("span")
                .txt("<<")
                .cls("button")
                .on("click", () => {
                    this.setCurrentPage(1);
                });

        var btnPrev = tpagination.tag("span")
                .txt("<")
                .cls("button")
                .on("click", this.prevPage);

        pageInput = tpagination.tag("input")
                .attr({
                    class: "dstbl-number",
                    type: "number",
                    min: "1",
                    max: this.pageCount,
                    value: this.currentPage
                })
                .on("change", () => {
                    this.setCurrentPage(Number(pageInput.value));
                });

        this.pageCountLabel = tpagination.tag("span");

        var btnNext = tpagination.tag("span")
                .txt(">")
                .cls("button")
                .on("click", this.nextPage);

        var btnLast = tpagination.tag("span")
                .txt(">>")
                .cls("button")
                .on("click", () => {
                    this.setCurrentPage(this.pageCount);
                });

        document.body.addEventListener("keydown", (e) => {
            if (dsTable.reloadRequestProcessing || e.target !== document.body)
                return; // aby nie przechwytywał zdarzeń kierowanych do inputów

            switch (e.keyCode) {
                case 37: // lewo
                    //  case 38: // góra                    
                    btnPrev.click();
                    e.cancelBuble = true; // przechwyć zdarzenie
                    break;
                case 39: // prawo
                    //case 40: // dół
                    btnNext.click();
                    e.cancelBuble = true; // przechwyć zdarzenie
                    break;
            }

        });


        //------------------ etykieta rezultatów --------------------------

        this.label = tpagination.tag("span");

        //------------------ szukajka --------------------------
        var delayedSearchTimeout;

        searchInput = container.tag("span").tag("input")
                .attr({
                    class: "dstbl-search",
                    type: "text",
                    placeholder: "Szukaj"
                })
                .on("change", (e) => {
                    this.filter({reset: true});
                })
                .on("keydown", (e) => {
                    clearTimeout(delayedSearchTimeout);
                    delayedSearchTimeout = setTimeout(searchInput.onchange, 300);
                });

        document.body.addEventListener("keydown", (e) => {
            if (e.target !== document.body)
                return; // aby nie przechwytywał zdarzeń kierowanych do inputów
            switch (e.keyCode) {
                case 27: // esc
                    searchInput.value = "";
                    this.filter({resize: true, reset: true});
                    break;
            }
        });

        document.body.addEventListener("keypres", (e) => {
            if (e.target !== document.body)
                return; // aby nie przechwytywał zdarzeń kierowanych do inputów
            searchInput.value += e.key;
            searchInput.onkeydown();
        });
    };


    this.unnest = (data) => {
        if (data && data.length)
            if (!(data[0] instanceof Array) || !data[0].length)
                return data;

        let result = [];

        data.forEach(row => {
            let idx = 0;
            let obj = {};

            for (var i = 0; i < dsTable.columns.list.length; i++) {
                obj[dsTable.columns.list[i].name] = row[idx++];
            }
            result.push(obj);
        });
        return result;
    };


    this.onWindowResize = (e) => {
        if (this.rowsPerPage) // tryb inny niż auto
            return;

        var count = this.getRowsPerPage();
        if (count === previousRowsPrePage)
            return;

        previousRowsPrePage = count;
        this.filter({
            resize: false,
            reset: false
        });
    };

    /**
     *      
     * @param {DsTableRow/HTMLTableRowElement} item// na jakim dsRow ma zostac wykonana operacja
     * @param {int} newIdx // opcjonalne , gdy brak nowa pozycja zostanie automatycznie obliczona na podstawie widoku     
     * 
     */
    this.reorder = (item, newIdx) => {

        if (item instanceof DsTableRow) {
            var dsRow = item;
            var trTag = item.trTag;
        }
        if (item instanceof HTMLTableRowElement) {
            var trTag = item;
            var dsRow = item.dsRow;
        }

        if (newIdx)
            dsRow.reorder(newIdx);

        var nextTrTag = trTag.nextSibling;
        var nextDsRow = nextTrTag ? nextTrTag.dsRow : null;
        var nextElemIdx = nextDsRow ? nextDsRow.getID() : null;

        var insertIn = null;

        if (nextElemIdx === null) {
            var prevTrTag = trTag.previousSibling;
            var prevDsRow = prevTrTag ? prevTrTag.dsRow : null;
            var prevElemIdx = prevDsRow ? prevDsRow.getID() : null;

            if (prevElemIdx !== null)
                insertIn = prevElemIdx + 1;
        } else
            insertIn = nextElemIdx;

        if (prevElemIdx !== null)
            dsRow.reorder(insertIn);

    }

    Object.preventExtensions(this);
}



function DsTableUpdateData(dsTable) {
    'use strict';
    this.update = (data) => {
        data = dsTable.rows.unnest(data);

        if (dsTable.continuous) {
            data.forEach(row => {
                new DsTableRow(dsTable).update(row);
            });
            dsTable.rows.filter({
                update: true,
                windowResize: true
            });
            return;
        }

        data.forEach(row => {
            if (Object.keys(row).length === 1) {
                for (let property in row) {
                    if (property === dsTable.primaryKeyColumn.name)
                        removeData(row);
                }
            }

            if (Object.keys(row).length > 1) {
                let pk = row[dsTable.primaryKeyColumn.name];
                let isRowExist = false;

                for (let i = 0; i < dsTable.rows.list.length; i++) {
                    if (dsTable.rows.list[i].primaryCell.value === pk) {
                        dsTable.rows.list[i].update(row);
                        isRowExist = true;
                    }
                }
                if (!isRowExist)
                    new DsTableRow(dsTable).update(row);
            }
        });

        dsTable.rows.filter({
            update: true,
            windowResize: true
        });
    };


    function removeData(row) {
        let primaryKeyVal = row[dsTable.primaryKeyColumn.name];
        for (let i = 0; i < dsTable.rows.list.length; i++) {
            if (primaryKeyVal === dsTable.rows.list[i].cells[dsTable.primaryKeyColumn.name].value)
                dsTable.rows.list[i].remove(i);
        }
    }

}


Utils.getTimestamp = function (date, format) {
    if (!date)
        return;

    if (!format)
        return date;

    var formatArray = format.split(/[\s-:]+/);
    var dateArray = date.split(/[\s-:]+/);
    var years = undefined;
    var months = undefined;
    var days = undefined;
    var hours = undefined;
    var minutes = undefined;
    var seconds = undefined;
    $.each(formatArray, function (idx, formatPart) {
        if (formatPart.includes("y")) {
            years = dateArray[idx];
        } else if (formatPart.includes("M")) {
            months = dateArray[idx];
        } else if (formatPart.includes("d")) {
            days = dateArray[idx];
        } else if (formatPart.includes("H")) {
            hours = dateArray[idx];
        } else if (formatPart.includes("m")) {
            minutes = dateArray[idx];
        } else if (formatPart.includes("s")) {
            seconds = dateArray[idx];
        }
    });
    return new Date(years, months - 1, days, hours, minutes, seconds).getTime();
}
;