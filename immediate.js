/**
 * Cloud9 Language Foundation
 *
 * @copyright 2011, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
define(function(require, exports, module) {
    main.consumes = ["language", "tabManager"];
    main.provides = [];
    return main;

    function main(options, imports, register) {
        var language = imports.language;
        var tabs = imports.tabManager;
        var completeUtil = require("plugins/c9.ide.language/complete_util");
    
        var GET_ALL_PROPERTIES = function getAllProperties(obj) {
            if (obj == null)
                return [];
            var results = [];
            do {
                var props = Object.getOwnPropertyNames(obj);
                props.forEach(function(prop){
                    if (results.indexOf(prop) === -1)
                        results.push(prop);
                });
            } while (obj = Object.getPrototypeOf(obj));
            return results;
        }.toString();

        language.registerLanguageHandler('plugins/c9.ide.language.javascript.immediate/immediate_complete');
        language.registerLanguageHandler('plugins/c9.ide.language.javascript.immediate/immediate_complete_static');
        
        language.on("initWorker", function(e) {
            var worker = e.worker;
            worker.on("js_immediate_complete", function(e) {
                onImmediateComplete(e.data.immediateWindow, e.data.expr, function(results) {
                    worker.emit("js_immediate_complete_results", { data: { results: results, id: e.data.id } });
                });
            });
        });
    
        function onImmediateComplete(immediateWindow, expr, callback) {
            var tab = tabs.findTab(immediateWindow);
            if (!tab || !tab.editor || !tab.editor.ace || !tab.editor.ace.getSession())
                return callback();
            
            var ace = tab.editor.ace;
            var evaluator = ace.getSession().repl.evaluator;
            var doc = ace.getSession().getDocument().getValue();
            
            var results;
            var propMatch = doc.match(/(.*)\.([A-Za-z0-9*$_]*)$/);
            var context;
            var id;
            if (propMatch) {
                context = propMatch[1];
                id = propMatch[2];
            }
            else {
                context = "window";
                id = doc.match(/[A-Za-z0-9*$_]*$/)[0] || "";
            }
            results = evaluator.evaluateHeadless(
                "(" + GET_ALL_PROPERTIES + ")(" + context + ")"
            );
            if (!results.length) // error
                callback();
            
            results = results.slice(); // make into real array
            results = completeUtil.findCompletions(id, results);
            callback(results.map(function(m) {
                return {
                  name        : m,
                  replaceText : m,
                  icon        : "property",
                  meta        : "",
                  priority    : m.match(/^_/) ? 1 : 2
                };
            }));
        }
        
        register(null, {});
    }
});