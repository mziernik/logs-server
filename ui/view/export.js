
/*jslint browser: true*/    // akceptuj elementy przeglądarki, np: window, document
/*jslint vars: true*/       // zezwól na wielokrotne deklaracje zmiennych
/*jslint unparam: true*/    //ignoruj nieużywane parametry funkcji

/*global $, logs, saveAs, Blob*/

// https://gist.github.com/johanalkstal/7178886
// http://jshint.com/docs/
// https://jslinterrors.com/a-was-used-before-it-was-defined

function saveToFile() {
    'use strict';

    logs.busy(true);

    window.setTimeout(function () {



        var js = "function showDetails(e){"
                + "e = e.nextSibling.style;"
                + " e.display = e.display === 'block' ? 'none' : 'block';"
                + "};";

        //
        var css =
                'body{color:#eee;background-color:#000;font-size:10pt;font-family:"Consolas","Lucida Console","Courier New",monospace;position:absolute;padding:0;margin:0;width:100%;height:100%;overflow:hidden;background-image:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-o-user-select:none;-ms-user-select:none;cursor:default;display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column}body[exported]{overflow: auto;}.busy{position:fixed;right:20px;top:20px;-webkit-transition:opacity .2s;transition:opacity .2s}#toolbar{background-color:#222;padding:4px;border-bottom:1px solid #666}#statusbar{color:#999;font-size:11px;background-color:#222;padding:2px 10px;border-top:1px solid #666}#statusbar:hover{color:#ddd}#toolbar button{background-color:#888;border:1px solid #000;color:#000;cursor:pointer}#toolbar button:hover{background-color:#aaa}#toolbar button:active{background-color:#c66}#main{flex:auto;-webkit-flex:auto;overflow:hidden}.splitter-vertical > '
                + '.splitter_bar{background-color:#222;border-left:1px solid #444;border-right:1px solid #666}#console{width:100%;height:auto;padding:4px;box-sizing:border-box;background-color:#000}#console > li{border:1px solid rgba(0,0,0,0);display:block;padding:2px}#console > li:hover{background-color:#111;border:1px solid #444}#console > li[expanded]{background-color:#111;border:1px solid #666}.log-details{display:none;padding:8px}.log-line'
                + '{white-space:nowrap;cursor:pointer;display:flex;display:-webkit-flex;vertical-align:top}.log-line-date,.log-line-tags{opacity:.8;flex-grow:0;flex-shrink:0;-webkit-flex-grow:0;-webkit-flex-shrink:0}.log-line-date{padding-right:8px}.log-line-tags{padding-right:10px}.log-line-value,.log-line-comment{text-overflow:ellipsis;display:inline-block;overflow:hidden}.log-line-comment{opacity:.8;margin-left:6px;font-size:.75em}.log-line-address{float:right;padding-left:8px}.log-details{-webkit-user-select:auto;-khtml-user-select:auto;-moz-user-select:auto;-o-user-select:auto;-ms-user-select:auto}.log-details > td > div{padding:10px;display:none;color:#eee;cursor:auto}.log-details > td > div td{padding:2px 6px}.log-details-data{border:1px solid #333;margin-bottom:20px;background-color:#000}.log-details-data > div:first-child{padding:3px 10px;background-color:#222;border-bottom:1px solid #333;cursor:pointer;color:#aaa;font-weight:700}.log-details-data > '
                + ':nth-child(2){padding:8px;overflow:auto;background-color:#000}.log-details-data-call-stack{color:#dca}.log-details-data-error-stack{color:#b55}.log-details-data-error-stack li[own]{color:#f33}.log-details-data-error-stack li hr{height:1px;margin:0;padding:0;border:none;background-color:#555;vertical-align:middle;margin-bottom:1em}.log-details-data table td:nth-child(1){color:#bbb}.log-line-date{color:#aaa}.log-line-tags{font-size:.8em;margin-top:.2em;opacity:.8}.log-line-address{font-size:.8em;margin-top:.2em;opacity:.8}.lk-event .log-line{color:#aca}.lk-debug .log-line{color:#aca}.lk-trace .log-line{color:#888}.lk-request .log-line{color:#aaa}.lk-log .log-line{color:#eee}.lk-warning .log-line{color:#FF7F00}.lk-error .log-line{color:#f33}.lk-query .log-line{color:#699}#filters{padding:4px;box-sizing:border-box}.fheader{clear:both;font-weight:700;color:#eab700;background-color:#222;text-align:center}.fheader:hover{background-color:#333}.fgroup{border:'
                + '1px solid #333;margin:4px;display:none}.fgroup ul{color:#ddd;padding:4px;clear:both;list-style:none;margin:0}.fgroup li{display:flex;display:-webkit-flex}.fgroup li>span:nth-child(1){font-size:.5em;flex-grow:0;flex-shrink:0;-webkit-flex-grow:0;-webkit-flex-shrink:0;margin-right:6px}.fgroup li>span:nth-child(1)>span:nth-child(1){color:#aaa}.fgroup li>span:nth-child(1)>span:nth-child(2){color:#000;font-size:1.5em}.fgroup li[checked=false] > span:nth-child(1) '
                + '> span:nth-child(1){color:#888}.fgroup li[checked=false]{color:#777}.fgroup li:hover{background-color:#222}.fgroup li>span:nth-child(2){overflow:hidden;white-space:nowrap;text-overflow:ellipsis;flex:auto;-webkit-flex:auto}.fgroup li>span:nth-child(3){color:#aaa;font-size:.7em;padding-top:2px;flex-grow:0;flex-shrink:0;-webkit-flex-grow:0;-webkit-flex-shrink:0}.f-buttons{display:flex;display:-webkit-flex;padding:4px}.f-buttons span{margin:4px;padding:4px;border:1px solid #888;flex:auto;-webkit-flex:auto;text-align:center;background-color:#333;cursor:pointer;color:#ccc;overflow:hidden;text-overflow:ellipsis}.f-buttons span:hover{border:1px solid #aaa;background-color:#555;color:#ddd}.f-buttons span:active{background-color:#c66;color:#000}.f-search{padding:4px}.highlight{background-color:#ee5;color:#005}.f-search input,.fdate{width:100%;box-sizing:border-box;padding:3px;background-color:#000;color:#ddd;border:1px solid #666}.fdate{margin:2px 0};'
                + '::-webkit-scrollbar{width:14px;background:transparent}::-webkit-scrollbar-thumb{background-color:#444}::-webkit-scrollbar-thumb:hover{background-color:#666}#filters::-webkit-scrollbar{width:6px}::-webkit-input-placeholder{color:#555}:-moz-placeholder{color:#555}::-moz-placeholder{color:#555}:-ms-input-placeholder{color:#555}::-webkit-scrollbar{width:12px}';

        var body = document.createElement("body");
        body.attr("exported", "true");

        var console = body.tag("ul");
        console.attr({id: "console"});
        $.each(logs.all, function (index, log) {
            log.build(console.tag("li"));
        });
        saveAs(new Blob(["<html>"
                    + "<head>\n"
                    + "<meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"/>\n"
                    + "<style>" + css + "</style>\n"
                    + "<script type=\"application/javascript\">" + js + "</script>\n"
                    + "</head>\n"
                    + body.outerHTML
                    + "</html>"],
                {type: "text/html;charset=utf-8"}),
                "logi.html");

        logs.busy(false);
    }, 10);


}


