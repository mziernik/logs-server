/* global HTMLTableElement */

function DsTableCell(row, column) {
    "use strict";
    this.column = Utils.checkInstance(column, ["DsTableColumn"]);

    row.cells[column.name] = this;
    var dsTable = row.dsTable;

    this.tags = []; // th, td
    this.row = row;
    this.value = null;
    this.initWidth = null; // szerokość komórki w pikselach

    this.trTag = row.trTag;
    this.tdTag = null;

    if (this.column === dsTable.primaryKeyColumn)
        this.row.primaryCell = this;


//    Element.prototype.insertChildAtIndex = function (child, index) {
//        if (!index)
//            index = 0
//        if (index >= this.children.length) {
//            this.appendChild(child)
//        } else {
//            this.insertBefore(child, this.children[index])
//        }
//    }
//
    this.display = (state) => {
        if (state && !this.tdTag)
            this.redraw();

        if (state && this.tdTag && !this.tdTag.parentNode)
            this.trTag.appendChild(this.tdTag);

        if (!state && this.tdTag && this.tdTag.parentNode === this.trTag)
            this.trTag.removeChild(this.tdTag);
    };


    this.redraw = () => {
        if (this.column.disabled)
            return;

        var value = this.value;


//        if (value === undefined)
//            throw new Error("Undefined cell data");


        if (this.tdTag)
            this.tdTag.clear();
        else
            this.tdTag = this.trTag.tag("td");


        this.tdTag.dsCell = this;

        switch (this.column.align) {
            case "L":
                this.tdTag.style.textAlign = "left";
                break;
            case "C":
                this.tdTag.style.textAlign = "center";
                break;
            case "R":
                this.tdTag.style.textAlign = "right";
                break;
        }

        let thWidth;

        // if (this.column.tags[0])
        //       thWidth = this.column.tags[0].style.width;


        if (thWidth)
            this.tdTag.style.width = thWidth;

        switch (column.type) {
            case "length":
                if (!isNaN(value))
                    this.tdTag.setText(Utils.formatFileSize(value));
                return;
        }

        switch ((typeof value)) {
            case "boolean":
                this.tdTag
                    .css({textAlign: 'center'})
                    .tag('span')
                    .cls(value ? "fa fa-check" : "fa fa-times");
                return;


            case "string":
            case "number":
                break;
            case "object":
                if (value instanceof Array) {
                    var temp = '';
                    for (var i = 0; i < value.length; i++) {
                        if (i === value.length - 1) {
                            switch ((typeof value[i])) {
                                case "string":
                                case "number":
                                    temp += value[i];
                                    break;
                            }
                        } else {
                            switch ((typeof value[i])) {
                                case "string":
                                case "number":
                                    temp += value[i] + ', ';
                                    break;
                            }
                        }
                    }
                    value = temp;
                } else {
                    value = '';
                }
                break;
            default:
                value = '';
        }

        value = ("" + value).trim().replaceAll("\n", "↵").replaceAll("\r", "");
        if (value.includes('Lista fraz'))
            console.log(value);


        this.tdTag.title = Utils.coalesce(value, '');

        dsTable.drawCell(this, this.tdTag, value);
    };

    Object.preventExtensions(this);
}