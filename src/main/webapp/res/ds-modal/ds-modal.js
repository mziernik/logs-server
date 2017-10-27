'use strict';

function DsModal(title) {

    this.tbase = null;
    this.tmain = null;
    this.theader = null;
    this.tleft = null;
    this.tcontent = null;
    this.tfooter = null;

    this.tFooterText = null;
    this.tFooterButtons = null;

    this.buttons = [];  //DsModalButton
    this.icon = null;
    this.focus = null;  // element typu input, na który ustawiony będzie focus
    this.onShow = null;

    this.title = title;
    // ----------------- flagi -------------------
    this.visible = null;

    // ---------- zdarzenia ---------------------
    this.onClose = null;
    this.onCancel = null; // metoda wywoływana tylko w przypadku kliknięcia na anuluj lub zamknięcia

    this.buttonsYesCancel = (onConfirm) => {
        this.button({
            type: "cancel",
            title: "Anuluj"
        });
        this.button({
            type: "ok",
            title: "OK",
            onClick: onConfirm
        });
        return this;
    };

    this.btnOK = (onClick) => {
        return this.button({
            type: "ok",
            title: "OK",
            onClick: onClick
        });
    };

    this.btnCancel = (onClick) => {
        return  this.button({
            type: "cancel",
            title: "Anuluj",
            onClick: onClick
        });
    };

    this.btnRemove = (onClick) => {
        return  this.button({
            type: "remove",
            title: "Usuń",
            onClick: onClick
        });
    };

    this.prompt = (content, defaultValue, onConfirm) => {
        var input;
        this.btnOK((btn, e) => onConfirm ? onConfirm(input.value, btn, e) : null);
        this.btnCancel();

        var div = $tag("div");
        div.tag("div", content);
        input = div.tag("input")
                .attr({
                    type: "edit",
                    value: defaultValue
                });
        this.icon = "edit";
        this.show(div);
    };

    this.confirm = (content, onConfirm, onCancel) => {
        this.btnOK(onConfirm);
        this.btnCancel();
        this.onCancel = onCancel;
        this.icon = "question-circle";
        this.onCancel = onCancel;
        this.show($tag("div", content));
        return this;
    };

    this.show = (html) => {

        if (this.icon)
            this.tleft.tag("span").cls("fa fa-" + this.icon);

        this.theader.tag("span", this.title);
        this.theader.tag("close")
                .cls("dsm-header-close fa fa-remove")
                .on("click", this.cancel);

        if (html)
            this.tcontent.appendChild(html);

        document.body.appendChild(this.tbase.parentNode);
        this.visible = true;


        if (!(this.focus instanceof HTMLElement)) {
            var tags = this.tbase.querySelectorAll("*");

            tags.forEach(tag => {

                switch (tag.nodeName) {
                    case "INPUT":
                    case "TEXTAREA":
                    case "SELECT":
                        this.focus = this.focus || tag
                        return false;
                }

            });
        }

        this.tbase.onkeydown = (e) => {

            switch (e.keyCode) {
                case 13:
                    if (e.target && e.target instanceof HTMLTextAreaElement)
                        return;
                    var btn = this.buttons.find(btn => btn.type === "ok");
                    if (btn && btn.tag)
                        btn.tag.click(e);
                    return;
                case 27:
                    this.cancel(e);
                    return;
            }

        };

        if (this.focus instanceof HTMLElement)
            this.focus.focus();

        if (typeof this.onShow === "function")
            this.onShow(this, e);

        return this;
    };

    this.cancel = (e) => {
        if (typeof this.onCancel === "function")
            this.onCancel(this, e);
        this.close();
        return this;
    };

    this.close = (e) => {
        if (!this.visible)
            return;
        if (typeof this.onClose === "function")
            this.onClose(this, e);
        this.visible = false;
        document.body.removeChild(this.tbase.parentNode);
        return this;
    };

    function DsModalButton(dsModal, data) {
        "use strict";
        this.title = data.title;
        this.type = ((data.type || "").toLowerCase());
        this.icon = data.icon;
        this.onClick = data.onClick;
        this.modal = dsModal;

        this.tag = dsModal.tFooterButtons.tag("button");


        switch (this.type) {
            case "ok":
                this.title = this.title || "OK";
                this.icon = this.icon || "check";
                break;

            case "cancel":
                this.title = this.title || "Anuluj";
                this.icon = this.icon || "ban";
                if (!this.onClick)
                    this.onClick = dsModal.cancel;
                break;

            case "remove":
                this.title = this.title || "Usuń";
                this.icon = this.icon || "trash";
                break;
        }


        var btn = this.tag;
        if (this.icon)
            btn.tag("span").cls("fa fa-" + this.icon);

        btn.tag("span", this.title);

        btn.onclick = (e) => {
            if (typeof this.onClick === "function")
                this.onClick(this, e);
            else
                this.modal.close(e);
        };

        dsModal.buttons.push(this);
    }

    this.button = (data, onClick) => {

        var obj = data;
        if (typeof obj === "string") {
            obj = {};
            obj.type = data;
        }

        obj.onClick = obj.onClick || onClick;

        new DsModalButton(this, obj);
        return this;
    };

    this.tbase = document.createElement("div")
            .cls("dsm-layout")
            .tag("div")
            .cls("dsm-base");

    this.tmain = this.tbase.tag("div")
            .cls("dsm-main panel-raised");

    this.theader = this.tmain.tag("div")
            .cls("dsm-header");

    var center = this.tmain.tag("div")
            .cls("dsm-middle panel-lowered");

    this.tleft = center.tag("div")
            .cls("dsm-left");

    this.tcontent = center.tag("div")
            .cls("dsm-content")
            .tag("div");
    this.tfooter = this.tmain.tag("div").cls("dsm-footer");

    this.tFooterText = this.tfooter.tag("span");
    this.tFooterButtons = this.tfooter.tag("span");
}

