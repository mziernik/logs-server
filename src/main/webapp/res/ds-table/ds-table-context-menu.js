/* global DsTable */

function DsTableContextMenu(dsTable, event) {
    "use strict";


    function autoUpdate(menu) {
        if (dsTable.autoUpdate === null)
            return;
        //ToDo: Aktualizuj automatycznie
        menu.add("Aktualizuj automatycznie", function (item) {
            dsTable.autoUpdate = !item.checked;
        }).checked = dsTable.autoUpdate;
    }

    function refresh(menu) {
        if (typeof dsTable.reloadData === "function")
            menu.add("Odśwież", () => dsTable.reloadData({}));
    }

    function select(menu) {
        if (!dsTable.selectable)
            return;
        menu.add("Zaznacz wiele", function (item) {
            alert("ToDo: Teraz powinny się pojawić chcekbox-y umożliwiające wybór wielu wierszy");
        });
    }

    function export_(menu) {

        if (typeof dsTable.reloadData !== "function")
            return;

        var miExport = menu.add("Eksport");

        miExport.add("XLS", function (item) {
            dsTable.reloadData({".export": {format: "xls"}});
        });

        miExport.add("CSV", function (item) {
            dsTable.reloadData({".export": {format: "csv"}});
        });

        miExport.add("XML", function (item) {
            dsTable.reloadData({".export": {format: "xml"}});
        });

        miExport.add("JSON", function (item) {
            dsTable.reloadData({".export": {format: "json"}});
        });

        miExport.add("HTML", function (item) {
            dsTable.reloadData({".export": {format: "html"}});
        });
    }

    function filter(menu, dsColumn, dsCell) {
        if (!dsColumn || !dsCell)
            return;

        var miFilter = menu.add('Filtr "' + dsColumn.caption + '"', null);

        miFilter.add('Równe "' + dsCell.value + '"');
        miFilter.add('Różne od "' + dsCell.value + '"');
    }

    function select(menu, dsColumn, dsCell) {
        if (!dsColumn || !dsCell)
            return;

        menu.add('Zaznacz "' + dsColumn.caption + '" = "' + dsCell.value + '"', null);
    }

    function sort(menu, dsColumn, dsCell) {
        if (!dsColumn)
            return;

        var miSort = menu.add('Sortuj "' + dsColumn.caption + '"', null);

        miSort.add("Rosnąco", () => {
            dsTable.sortCol.sortOrder = null;
            dsColumn.sortOrder = 1;
            dsTable.sortCol = dsColumn;
            dsTable.rows.filter({sort: true, reset: true});
        });

        miSort.add("Malejąco", () => {
            dsTable.sortCol.sortOrder = null;
            dsColumn.sortOrder = -1;
            dsTable.sortCol = dsColumn;
            dsTable.rows.filter({sort: true, reset: true});
        });
    }

    function columns(menu) {
        var miCols = menu.add("Kolumny");

        $.each(dsTable.columns.list, function (idx, col) {

            var mi = miCols.add(col.caption, function (item) {
                col.hidden = item.checked;
                item.data.checked = !item.checked;
                dsTable.redraw(true);
            });
            mi.checked = !col.hidden;
            mi.column = col;

        });
    }

    function results(menu) {
        var miResults = menu.add("Ilość rezultatów");

        var rowsPerPage = dsTable.rows.rowsPerPage;

        $.each([0, 10, 25, 50, 100], function (idx, element) {

            var mi = miResults.add(!element ? "Auto" : element, (item) => {
                dsTable.rows.setRowsPerPage(item.rowsPerPage);
            });

            mi.checked = element === rowsPerPage;
            mi.rowsPerPage = element;
        });
    }


    var td = event.target.getParent('td');

    var dsCell = event.target.dsCell
            ? event.target.dsCell : td
            ? td.dsCell : null;

    var dsColumn = event.target.dsColumn ? event.target.dsColumn
            : dsCell ? dsCell.column : td
            ? td.dsColumn : null;

    var menu = new PopupMenu();


    var miOptions = menu.add("Opcje");
    autoUpdate(miOptions);
    columns(miOptions);
    results(miOptions);

    refresh(menu);
    select(menu);

    filter(menu, dsColumn, dsCell);
    if (dsTable.selectable)
        select(menu, dsColumn, dsCell);

    sort(menu, dsColumn, dsCell);

    export_(menu);


    menu.show();

    return false;
}
