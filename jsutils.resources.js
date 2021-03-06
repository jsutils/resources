define({
    name: "jsutils.resources",
    modules: ["jQuery", "jsutils.file", "jsutils.cache", "JSON", "JSONPath", "bootloader"]
}).as(function(RESOURCEUTIL, jq, fileUtil, cacheUtils, JSON, JSONPath, bootloader) {

    var cacheable = cacheUtils.instance("jsutils.resources");
    var DFERRED = {};
    return {
        getJSON: function(fileNameJson) {
            var version = (bootloader && bootloader.config) ?
                JSONPath("resource.version").load(bootloader.config(), bootloader.config().version) : 0;
            var fileName = fileNameJson,
                fileNameKey = fileName;
            var langMap = cacheable.get(fileNameKey);
            if (langMap) {
                langMap = JSON.parse(langMap);
            }
            if (langMap && langMap.version >= version) {
                return jq.when(langMap);
            } else {
                return (function(dff){
                    DFERRED[fileNameJson] = dff;
                    return DFERRED[fileNameJson];
                })(DFERRED[fileNameJson] || fileUtil.getJSON(fileNameJson).then(function(resp) {
                    resp.version = version || resp.version;
                    cacheable.set(fileNameKey, JSON.stringify(resp));
                    return resp;
                }));
            }
        }
    };

});
