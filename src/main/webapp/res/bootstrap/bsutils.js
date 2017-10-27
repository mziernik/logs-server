/* global ajax */
/* global $id */

function bsModalForm(id, url, params) {

    var pre = "pre_" + id;
    var tag = $id(pre);

    ajax.post(url, {
        params : params
    }, function(http) {
        if (!tag) {
            tag = document.body.tag("div");
            tag.setAttribute("id", pre);
        }
        tag.innerHTML = http.responseText;


        $("#" + id).on("hidden.bs.modal", function() {
            tag.remove();
        });

        $("#" + id).modal("show");
    });
}

function bsFormEvent(params) {

    var pars = {
        formId : null,
        event : null,
        inputId : ""
    };

    var form = $id(params.formId);
    if (!form && params.inputId && $id(params.inputId))
        form = $id(params.inputId).form;
    if (!form || !form.elements)
        return false;
    var json = [];
    function add(id, type, name, value, el) {
        var props = {};
        for (var i = 0, attr = el.attributes[i]; i < el.attributes.length; attr = el.attributes[i], i++)
            if (attr.nodeName.startsWith("data-"))
                props[attr.nodeName.substring(5)] = attr.nodeValue;
        json.push([id, type, name, value, props]);
    }


    var _groupsArr = form.getAttribute("data-bsgroups");
    if (!_groupsArr)
        return;
    _groupsArr = JSON.parse(_groupsArr);

    var groups = [];
    for (var i = 0; i < _groupsArr.length; i++)
        groups.push({
            group : $id(_groupsArr[i][0]),
            input : $id(_groupsArr[i][1]),
            label : $id(_groupsArr[i][2])
        });
    var elems = form.elements;
    var i, j, first;
    for (i = 0; i < elems.length; i += 1, first = false) {
        var elm = elems[i];
        if (!elm.name.length)
            continue;
        switch (elm.type) {
            case 'select-one':
                first = true;
            case 'select-multiple':
                for (j = 0; j < elm.options.length; j += 1)
                    if (elm.options[j].selected) {
                        add(elm.id, elm.type, elm.name, elm.options[j].value, elm);
                        if (first)
                            break; /* stop searching for select-one */
                    }
                break;
            case 'checkbox':
            case 'radio':
                if (!elm.checked)
                    break; /* else continue */
            default:
                add(elm.id, elm.type, elm.name, elm.value, elm);
                break;
        }
    }

    ajax.post(form.getAttribute("data-action"), {
        params : {
            event : params.event,
            sender : params.inputId ? params.inputId : form.id
        },
        post : JSON.stringify(json),
        contentType : "application/javascript"
    },
    function(http) {
        var obj = JSON.parse(http.responseText);
        _obj = {
            correct : false,
            disabled : false,
            evalBefore : "", // skrypt do wykonania
            evalAfter : "",
            fields : {}
        };
        if (obj.evalBefore)
            eval(obj.evalBefore);

        var firstError;
        for (var name in obj.fields) {
            if (!name.startsWith("f_"))
                continue;
            var input = $id(name.substring(2));
            if (!input)
                continue;
            var field = obj.fields[name];
            input.value = field.val;
            var group;
            for (var i = 0; i < groups.length; i++)
                if (groups[i].input === input) {
                    group = groups[i];
                    break;
                }

            if (!group)
                return;
            var tgroup = group.group;
            var err = field.sts === "error" || field.sts === "warning";
            if (err && !firstError)
                firstError = tgroup;
            var grCls = tgroup.getAttribute("class");
            if (tgroup.orgCls)
                grCls = tgroup.orgCls;
            else
                tgroup.orgCls = grCls;
            if (group.input.hasAttribute("required") || field.required === true) {
                group.label.setAttribute("data-required", "required");
                group.input.setAttribute("required", "required");
            }

            if (field.required === false) {
                group.label.removeAttribute("data-required");
                group.input.removeAttribute("required");
            }

            if (field.disabled === true)
                group.input.setAttribute("disabled", "disbaled");
            if (field.disabled === false)
                group.input.removeAttribute("disabled");
            var msgType = {
                none : null,
                correct : "has-success",
                warning : "has-warning",
                error : "has-error"
            };

            if (field.sts) {
                for (var name in msgType)
                    grCls = grCls.replace(msgType[name], "");
                tgroup.setAttribute("class", grCls + (field.sts && field.sts !== "none"
                        ? " " + msgType[field.sts] : ""));
            }
            if (!tgroup.bsFeedback)
                tgroup.bsFeedback = tgroup.span();
            if (err) {
                if (!tgroup.bsFeedbacklabel)
                    tgroup.bsFeedbacklabel = tgroup.span();
                tgroup.bsFeedbacklabel.setText(field.stsmsg).cls("control-label");
            } else if (tgroup.bsFeedbacklabel) {
                tgroup.bsFeedbacklabel.remove();
                tgroup.bsFeedbacklabel = null;
            }
        }

        if (firstError && params.event === "submit")
            firstError.scrollIntoView(true);



        if (obj.evalAfter)
            eval(obj.evalAfter);
    });
    return false;
}