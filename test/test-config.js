(function(global, undef) {

	function noop() {}

    // Fake console if we need to
   	if (typeof global.console === undef) {
   		global.console = { log: noop, error: noop };
   	}

	var doc, head, scripts, script, i, baseUrl, baseUrlSuffix,
		selfName, selfRegex, loaders, loader, loaderName, loaderPath, loaderConfig;

    loaderName = 'curl';

    // Try to get loader name from location hash
    try {
        loaderName = (global.location.hash).slice(1) || loaderName;
    } catch(e) {
    }

	selfName = 'test-config.js';
	selfRegex = new RegExp(selfName + '$');

	baseUrlSuffix = '../';

    loaders = {
        curl: {
            script: 'test/curl/src/curl',
            mixin: {
                apiName: 'require',
                pluginPath: 'curl/plugin',
                paths: {
					'jquery': 'test/lib/jquery'
//                    'wire/domReady': 'test/curl/src/curl/domReady'
                },
                preloads: [
                    'curl/shim/dojo16'
                ]
            }
        },
        requirejs: {
            script: 'test/requirejs/require',
            mixin: {
                paths: {
//                    'wire/domReady': 'test/requirejs/domReady'
                    domReady: 'test/requirejs/domReady'
                }
            }
        }
    };
    
    function addPackage(pkgInfo) {
        var cfg;
        
        if(!loaderConfig.packages) loaderConfig.packages = [];
        
        cfg = loaderConfig.packages;
        pkgInfo.main = pkgInfo.main || pkgInfo.name;
        cfg.push(pkgInfo);
    }

    loader = loaders[loaderName];
    
	loaderPath = loader.script;

	doc = global.document;
	head = doc.head || doc.getElementsByTagName('head')[0];

	// Find self script tag, use it to construct baseUrl
	i = 0;
	scripts = head.getElementsByTagName('script');
	while((script = scripts[i++]) && !baseUrl) {
		if(selfRegex.test(script.src)) {
			baseUrl = script.src.replace(selfName, '') + baseUrlSuffix;
		}
	}

	// dojo configuration, in case we need it
	global.djConfig = {
		baseUrl: baseUrl
	};

	// Setup loader config
	global[loaderName] = loaderConfig = {
		baseUrl: baseUrl,
		paths: {}
	};
    
    for(var m in loader.mixin) {
        loaderConfig[m] = loader.mixin[m];
    }

    addPackage({ name: 'dojo', location: 'test/lib/dojo', main: 'lib/main-browser' });
    addPackage({ name: 'dijit', location: 'test/lib/dijit', main: 'lib/main' });
    addPackage({ name: 'sizzle', location: 'support/sizzle' });
    addPackage({ name: 'aop', location: 'support/aop' });
    addPackage({ name: 'when', location: 'support/when' });
    addPackage({ name: 'cola', location: 'support/cola' });
    // This is needed because we're running unit tests from *within* the wire dir
    addPackage({ name: 'wire', location: '.' });

//    console.log(JSON.stringify(loaderConfig));

	// Other loaders may not need this
	loaderConfig.paths[loaderName] = loaderPath;

	if(typeof console.log != 'function') {
		doh.debug = function(){
			var msg = "";
			for(var x=0; x<arguments.length; x++){
				msg += " "+arguments[x];
			}
//			sendToLogPane([msg]);
			console.log("DEBUG:"+msg);
		};
	}

	// That's right y'all, document.write FTW
	doc.write('<script src="' + baseUrl + loaderPath + '.js' + '"></script>');

})(window);