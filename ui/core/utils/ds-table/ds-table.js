/* global HTMLTableElement */


/* =================================== ToDo: ===================================
 - naciśnięcie ESC powoduje zmianę rozmiaru kolumn
 - zmiana szerokosci kolumn: sprawdzac w mosusemove czy wcisniety jest klawisz
 + opcja dostosowująca ilość wierszy do wysokości + przełączanie stron rolką
 + próba pokazania/ukrycia kolumny wywołuje błąd
 - zmiana rozmiaru ostatniej kolumny
 + rozjazd szerokości td i th gdy pojawia się suwak
 + doać metodę onOrderChanged wywoływaną w momencie zmiany kolejności wierszy 
 (kolejność wierszy powinna być zmianiona również w dsTable.rows.list)
 - optymalizacja rows.onWindowResize -> filter w przypadku automatycznej ilości wierszy na stronę

 =============================================================================*/

/**
 *
 * @param {DsTable} dsTable
 * @param {function{DsTableOptions}} callback
 * @returns {DsTableOptions}
 */
function DsTableOptions(dsTable, callback) {
    "use strict";

    // wymagane
    this.id = ""; //
    this.tag = null; // HTMLTableElement
    // opcjonalne
    this.controller = null; // SPAController
    this.webApiMethod = null; // metoda WebApi odpowiedzialna za wczytanie i przeładowanie danych
    this.sortable = null; // {boolean} czy można wiersze sortować metodą drag and drop, null: automatycznie
    this.selectable = null; //{boolean} checkboxy w wierszach, null: automatycznie
    this.autoUpdate = true; // nie przetwarzaj zdarzeń aktualizacji danych
    this.changePageWithMouseWheel = true; // czy umożliwić zmianę stron za pośrednictwem rolki myszki
    this.fitHeight = true; // dopasuj wysokość tabeli do rodzica (rozciągnij w pionie)
    Object.preventExtensions(this);
    callback(this);

}

/**
 *
 * @param {function(DsTableOptions)} optionsCallback - Konfiguracja
 * @returns {DsTable}
 */
function DsTable(optionsCallback) {
    "use strict";

    if (typeof optionsCallback !== "function")
        throw new Error("Wymagana funkcja zwrotna jako argument konstruktora");

    let opt = this.options = new DsTableOptions(this, optionsCallback);

    let id = opt.id;
    if (!id && opt.controller)
        id = opt.controller.id;

    this.controller = Utils.checkInstance(opt.controller, ["SPAController"]);
    this.id = Utils.checkId(id, ".");
    this.tblTag = Utils.checkNotNull(
        Utils.checkInstance(opt.tag, [HTMLTableElement]),
        "Wymagana wartość tblTag");

    this.tblTag.dsTable = this;

    this.theadTr = null;
    this.tbody = null;
    this.dataSet = null;

    // this.pagination;
    this.updateData = new DsTableUpdateData(this);

    const columns = this.columns = new DsTableColumns(this);
    const rows = this.rows = new DsTableRows(this);

    this.primaryKeyColumn = null; // DsTableColumn


    this.sortCol = null;

    this.drawing = false;

//    --Jak działa bez, to do wywalenia--
//    this.visibleRowsCount = 0;

    this.selectable = false;
    this.sortable = true;

    this.autoUpdate = this.options.autoUpdate;

    this.continuous = null;
    this.reloadRequestProcessing = false; // czy aktualnie trwa przetwarzanie żądania api

    var dsTable = this;

    this.onUpdate = (data) => {
        if (!data || !this.autoUpdate)
            return;
//        alert(JSON.stringify(data, null, 2));
        this.updateData.update(data);
    };

    // zdarzenie wywoływane po wczytaniu danych
    this.onDataLoaded = (dataSet) => {

    };

    this.onDblClick = (e, cell) => {
        //  alert("Double Click");
    };

    this.onClick = (e, cell) => {
        //  alert("Click");
    };

    this.addRow = (tbody, row) => {
        return row.build(tbody);
    };

    this.addCell = (tr, cell) => {
        return cell.redraw();
    };

    this.drawCell = (cell, td, value) => {
        td.innerText = value || "\xa0";
    };

    this.addColumn = (tr, col) => {
        return col.build(tr);
    };

    this.addColumns = (tr) => {
        $.each(columns.list, (idx, col) => {
            this.addColumn(tr, col);
        });
    };

    this.reloadData = (params) => {//przeładowanie danych
        Utils.requireFunction(this.options.webApiMethod);

        this.reloadRequestProcessing = true;
        this.options.webApiMethod({
            params: params || {},
            onSuccess: this.load
        });
        return this;
    };

    this.load = (dataSet, resize) => {
        this.reloadRequestProcessing = false;
        this.rows.load(dataSet, resize);
    };

    // zapisz wartość w Local Storage
    this.savePublicValue = (name, value) => {
        window.localStorage.setItem("dstbl." + name, Utils.escape(value));
    };

    // wczytaj wartość z Local Storage
    this.loadPublicValue = (name, defValue) => {
        var result = window.localStorage.getItem("dstbl." + name);
        return result ? JSON.parse(result) : defValue;
    };

    // zapisz wartość w Local Storage
    this.savePrivateValue = (name, value) => {
        window.localStorage.setItem("dstbl." + this.id + "." + name,
            Utils.escape(value));
    };

    // wczytaj wartość z Local Storage
    this.loadPrivateValue = (name, defValue) => {
        var result = window.localStorage.getItem("dstbl." + this.id + "." + name);
        return result ? JSON.parse(result) : defValue;
    };


    //event wywoływany na zmianę kolejności kolumn na d'n'd
    this.onOrderChanged = (event, ui) => {
        this.rows.reorder(ui.item[0]);//trTag
    };

    this.redraw = (resizeColumns) => {

        this.tbody.clear();

        rows.list.forEach(row => {
            row.redraw();
        });


        rows.list.forEach(row => {
            row.display(row.visible);
        });

        if (this.sortable)
            $(this.tbody).sortable({
                handle: ".th-sortable"
            }).bind('sortupdate', this.onOrderChanged);

        this.theadTr.clear();
        columns.addColumns(this.theadTr);

        columns.list.forEach((col) => {
            col.getTags(true).forEach(tag => {
                tag.cls(col.sortOrder === 1 ? "sorting_desc"
                    : col.sortOrder === -1 ? "sorting_asc"
                        : "");
            });
        });

        if (resizeColumns || !this.columns.calculated)
            this.columns.resize();
        else
            this.columns.applyCssWidths();
    };


    this.onWindowResize = (e) => {
        this.rows.onWindowResize(e);
        this.columns.onWindowResize(e);
    };

    //============================================================================

    if (this.options.fitHeight)
        this.tblTag.setAttribute("data-full-height", "true");

    this.theadTr = this.tblTag.tag("thead").tag("tr");

    this.tbody = this.tblTag.tag("tbody");
    this.tbody.clear();

    this.columns.createResizer(this.theadTr);

    window.addEventListener("resize", this.onWindowResize);

    // -------- automatyczna zmiana stron podczas scroll-owania rolką ----------

    (function autoPgeChangeOnScroll(tbody, rows) {
        var scrollDelta = 0;

        tbody.addEventListener("mousewheel", (e) => {
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            if (delta < 0 && tbody.scrollTop + tbody.offsetHeight === tbody.scrollHeight) {
                ++scrollDelta;
                if (!rows.rowsPerPage || scrollDelta > 2)
                    setTimeout(() => {
                        scrollDelta = 0;
                        rows.nextPage();
                    });
                return;
            }

            if (delta > 0 && tbody.scrollTop === 0) {
                ++scrollDelta;
                if (!rows.rowsPerPage || scrollDelta > 2)
                    setTimeout(() => {
                        scrollDelta = 0;
                        if (rows.prevPage())
                            tbody.scrollTop = tbody.scrollHeight; // przescroluj na dół
                    });
                return;
            }

            scrollDelta = 0;

        });
    }(this.tbody, rows));

    //--------------------------------------------------------------------------

//    this.tbody.oncontextmenu = this.theadTr.oncontextmenu = (e) => {
//        new DsTableContextMenu(this, e);
//        return false;
//    };

    this.tbody.ondblclick = (e) => {
        var cell;
        var tag = e.target;
        while ((!cell) && !(tag instanceof HTMLTableElement)) {
            cell = tag.dsCell;
            tag = tag.parentNode;
        }
        if (cell)
            this.onDblClick(e, cell);
    };

    this.tbody.onclick = (e) => {
        var cell;
        var tag = e.target;
        while ((!cell) && !(tag instanceof HTMLTableElement)) {
            cell = tag.dsCell;
            tag = tag.parentNode;
        }
        if (cell)
            this.onClick(e, cell);
    };

    //--------------------------- STOPKA -----------------------------
    this.tfoot = this.tblTag.tag("tfoot");
    var td = this.tfoot.tag("tr").tag("td");
    this.rows.buildFooter(td);
    Object.preventExtensions(this);
}





