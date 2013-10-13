/**
 * Cloud9 Language Foundation
 *
 * @copyright 2011, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
define(function(require, exports, module) {
    main.consumes = ["language"];
    main.provides = [];
    return main;

    function main(options, imports, register) {
        var language = imports.language;

        language.registerLanguageHandler('plugins/c9.ide.language.javascript.immediate/immediate_complete');
        language.registerLanguageHandler('plugins/c9.ide.language.javascript.immediate/immediate_complete_static');
        
        language.on("initWorker", function(e) {
            var worker = e.worker;
            worker.on("js_immediate_complete", function(e) {
                onImmediateComplete(e.immediateWindow, function(results) {
                    worker.emit("js_immediate_complete_results", { data: results });
                });
            });
        });
        
        register(null, {});
    }
    
    function onImmediateComplete(immediateWindow, callback) {
        callback([]);
    }
});