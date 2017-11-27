function DsTreeOptions(tree, callback) {

    if (typeof callback !== "function")
        throw new Error("Wymagana funkcja zwrotna jako argument konstruktora");

    this.tag = null;
    this.id = null;
    this.controller = null;

    Object.preventExtensions(this);
    callback(this);

    tree.tag = new HtmlElementProvider(this.tag);
    tree.controller = Utils.checkInstance(this.controller, ["SPAController"]);

    tree.id = this.id;
    if (!tree.id && this.controller)
        tree.id = this.controller.id + ".tree";

    Utils.checkId(tree.id, ".");
}

function DsTree(optionsCallback) {
    "use strict";

    this.tag = null;
    this.controller = null;
    this.id = null;
    this.options = new DsTreeOptions(this, optionsCallback);

    this.extra = {};  // pola dodatkowe
    this.items = []; // struktura drzewiasta
    this.allItem = []; // plaska struktura
    this.expandedArray = [];

    this.ul = null;

    //-------------------------------------------

    /**
     * 
     * @param {DsTreeNode} node
     * @param {boolean} expanded
     * @returns {undefined}
     */
    this.onExpand = function (node, expanded) {

    };

    this.saveValue = (name, value) => {
        if (this.controller) {
            var id = this.id;
            if (id === this.controller.id + ".tree")
                id = "tree";
            this.controller.saveValue(id + "." + name, value);
        }
    };

    this.loadValue = (name) => {
        if (this.controller) {
            var id = this.id;
            if (id === this.controller.id + ".tree")
                id = "tree";
            return this.controller.loadValue(id + "." + name);
        }
    };

    this.getById = (id) => {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].id === id)
                return this.items[i];
        return null;
    };

    this.item = (id, name) => {
        return new DsTreeNode(this, this, id, name);
    };

    this.clear = () => {
        this.items = [];
        this.expandedArray = [];
        this.tag.get().clear();
    };

    this.expandedArray = this.loadValue("expanded") || [];

    Object.preventExtensions(this);
}


/**
 * 
 * @param {DsTree} root
 * @param {DsTreeNode} parent
 * @param {string} id
 * @param {string} name
 * @returns {DsTree}
 */
function DsTreeNode(root, parent, id, name) {
    "use strict";

    this.items = [];
    this.name = name;
    this.id = id;
    this.parent = Utils.checkInstanceF(parent, [DsTree, DsTreeNode]);

    this.path = (parent.path ? parent.path + "." : "") + id;

    this.comment = null;
    this.title = null;
    this.expanded = root.expandedArray.contains(this.path);
    this.expandable = null; // wymuszenie statusu "rozwijalny"
    this.root = root;

    this.level = parent === root ? 0 : parent.level + 1;
    // --------------- tagi ----------------------
    this.li = null;
    this.liHeader = null;
    this.ul = null;
    this.marker = null;
    this.extra = {}; // pola dodatkowe

    this.onClick = null;
    this.onContextMenu = null;
    this.data = null; // obiekt ogólnego przeznaczenia

    parent.items.push(this);
    root.allItem.push(this);

    this.isExpandable = () => {
        var result = typeof this.expandable === "boolean"
                ? this.expandable
                : this.items.length > 0;

        if (this.marker)
            this.marker.cls("ds-xtree-marker " + (result ? "fa fa-angle-right" : ""));

        return result;
    };

    this.getById = (id) => {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].id === id)
                return this.items[i];
        return null;
    };

    this.item = (id, name) => {
        return new DsTreeNode(this.root, this, id, name);
    };

    this.expand = (expanded) => {
        if (!this.isExpandable())
            return;

        this.expanded = expanded;

        if (expanded) {
            // this.update();
            this.items.forEach((node) => {
                node.update();
            });
        }
        if (this.parent)
            $(this.ul).slideToggle(200, () => {
                if (this.marker)
                    this.marker.cls("ds-xtree-marker fa fa-angle-"
                            + (this.ul.style.display === "none" ? "right" : "down"));
            });


        this.root.expandedArray = [];
        var visit = (node) => {
            if (node.expanded)
                this.root.expandedArray.push(node.path);
            $.each(node.items, (idx, nd) => {
                visit(nd);
            });
        };
        visit(this.root);
        this.root.saveValue("expanded", this.root.expandedArray);
    };

    this.update = () => {

        if (this.parent === this.root && !this.parent.ul)
            this.parent.ul = this.root.tag.get()
                    .cls("ds-xtree-ul");

        if (!this.li) {
            this.li = this.parent.ul.tag("li");
            this.li.dsTree = this;
        }

        if (this.liHeader)
            this.liHeader.clear();
        else
            this.liHeader = this.li.tag("div")
                    .cls("ds-xtree-header");

        var hdr = this.liHeader;
        hdr.dsTree = this;

        hdr.style.paddingLeft = (this.level * 20) + "px";
        hdr.dsTree = this;

        var name = this.name;
        var par = this.parent;
        while (par && par.name) {
            name = par.name + "." + name;
            par = par.parent;
        }

        hdr.onclick = (e) => {
            this.expand(!this.expanded);
            root.onExpand(this, !this.expanded);

            if (typeof this.onClick === "function")
                this.onClick(this.data, this, e);
        };

        hdr.oncontextmenu = (e) => {
            if (typeof this.onContextMenu === "function")
                return this.onContextMenu(this.data, this, e);
            return true;
        };

        this.marker = hdr.tag("span").cls("ds-xtree-marker");

        hdr.title = this.title ? this.title : name + (this.comment ? " (" + this.comment + ")" : "");

        hdr.tag("span", this.name).cls("ds-xtree-name");
        if (this.comment)
            hdr.tag("span", this.comment).cls("ds-xtree-comment");

        if (!this.ul)
            this.ul = this.li.tag("ul")
                    .cls("ds-xtree-ul");

        this.ul.dsTree = this;
        this.ul.style.display = this.expanded || !this.parent ? "block" : "none";

        this.isExpandable(); // wywołuje przerysowanie wskaźnika

    };

    if (this.level === 0 || this.expanded || this.parent.expanded)
        this.update();

    this.parent.marker && this.parent.isExpandable();// wywołuje przerysowanie wskaźnika

    Object.preventExtensions(this);
}
