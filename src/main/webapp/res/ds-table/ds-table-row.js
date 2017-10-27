/* global HTMLTableElement */

function DsTableRow(dsTable, rowData) {
    "use strict";

    dsTable.rows.list.push(this);
    var rows = dsTable.rows;
    this.dsTable = dsTable;
    this.trTag = null;

    this.cells = {}; //DsTableCell
    this.primaryCell = null;
    var searchableString = null;
    this.similarity = new FuzzySet(this);

    this.visible = true; // wiersz widoczny jest w tabeli na danej stronie
    this.disabled = false; // wierszy odfiltrowany, niewidoczny

    this.thSelectable = null; // komórka zawierająca checkboxa
    this.thSortable = null; // komórka zawierająca 'uchwyt' do sortowania D&D

    this.display = (state) => {
        if (state && this.trTag && !this.trTag.parentNode)
            dsTable.tbody.appendChild(this.trTag);

        if (!state && this.trTag && this.trTag.parentNode === dsTable.tbody)
            dsTable.tbody.removeChild(this.trTag);
    };


    this.redraw = () => {
        if (!this.visible)
            return;

        if (this.trTag) {
            this.trTag.clear();

            if (dsTable.sortable)
                this.thSortable = this.trTag.tag("td")
                        .cls("th-sortable")
                        .tag("span")
                        .cls("fa fa-grip")
                        .parentNode;


            if (dsTable.selectable) {
                this.thSelectable = this.trTag.tag("td").cls("th-selectable");
                let label = this.thSelectable.tag("label");
                label.tag("input")
                        .cls("dsTbl")
                        .attr({
                            type: "checkbox"
                        });
                label.tag("span");

            }

            $.each(this.cells, (idx, cell) => {
                cell.display(cell.column.isVisible());
            });


        }


    };

    this.update = (rowData) => {
        Utils.checkInstance(rowData, ["Object", "Array"]);

        searchableString = null;

//    --Jak działa bez, to do wywalenia--
//        dsTable.visibleRowsCount++;
//        if (dsTable.visibleRowsCount < rows.offset)
//            return false;

        this.trTag = this.trTag || $tag("tr");
        this.trTag.dsRow = this;

        $.each(dsTable.columns.list, (idx, col) => {
            let cell = (this.cells[col.name] || new DsTableCell(this, col));
            cell.value = Utils.coalesce(rowData[idx], rowData[col.name], cell.value);
        });

        $.each(this.cells, (idx, cell) => {
            if (cell.column.isVisible())
                dsTable.addCell(this.trTag, cell);
        });
    };

    this.getSearchableString = () => {
        if (searchableString !== null)
            return searchableString;


        searchableString = "";
        this.similarity.clean();

        $.each(this.cells, (idx, cell) => {

            if (!cell.column.searchable || cell.value === undefined || cell.value === null)
                return;


            var charList = [' ', '.', ':', ';', '?', '!', '~', ',', "'", '"', '&', '|', '(', ')', '<', '>', '{', '}', '\\', '[', ']', '/'];
            var text = cell.value.toString();

            var wordList = [];

            var word = '';
            var char = '';

            for (var i = 0; i < text.length; i++) {
                char = text[i];
                if (charList.indexOf(char) < 0) {
                    word += char;
                } else if (word) {
                    wordList.push(word);
                    word = '';
                }
            }
            if (word) {
                wordList.push(word);
                this.similarity.add(word);
            }

            searchableString += wordList.join('');

        });
        return searchableString;
    };

    this.remove = (idx) => {
        let trTag = this.trTag;
        if (trTag && trTag.parentNode)
            trTag.parentNode.removeChild(trTag);
        dsTable.rows.list.splice(idx, 1);
    };

    this.getID = () => {
        for (var idx = 0; idx < dsTable.rows.list.length; idx++) {
            if (dsTable.rows.list[idx] === this)
                return idx;
        }
        return null;
    };

    /**
     * 
     * @param {int} newIdx // index pod który ma zostać przeniesiony element
     * gdy stary index jest mniejszy od nowego, automatycznie pozycja jest korygowana 
     * tak aby po usunięciu został wstawiony w odpowiednie miejsce 
     * @returns {undefined}
     */
    this.reorder = (newIdx) => {
        var oldIdx = this.getID();
        if (oldIdx !== null || typeof oldIdx === 'undefined') {
            newIdx = oldIdx < newIdx ? newIdx - 1 : newIdx;
            dsTable.rows.list.splice(oldIdx, 1);
        }

        dsTable.rows.list.splice(newIdx, 0, this);
        console.log(dsTable.rows.list);
    }

    Object.preventExtensions(this);
}
