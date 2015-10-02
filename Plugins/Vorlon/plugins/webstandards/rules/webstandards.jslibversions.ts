module VORLON.WebStandards.Rules.JavaScript {
    var libraries = [
		{
			name: 'Prototype',
			minVersions: [
				{ major: '1.7.', minor: '2' }
			],
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/Prototype JavaScript framework, version (\d+\.\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'Dojo',
			minVersions: [
				{ major: '1.5.', minor: '3' },
				{ major: '1.6.', minor: '2' },
				{ major: '1.7.', minor: '5' },
				{ major: '1.8.', minor: '5' },
				{ major: '1.9.', minor: '2' },
				{ major: '1.10.', minor: '0' }
			],
			check: function(checkVersion, scriptText) {
				if (scriptText.indexOf('dojo') === -1) {
					return false;
				}

				var version = scriptText.match(/\.version\s*=\s*\{\s*major:\s*(\d+)\D+(\d+)\D+(\d+)/m);
				if (version) {
					return checkVersion(this, version[1] + '.' + version[2] + '.' + version[3]);
				}

				version = scriptText.match(/\s*major:\s*(\d+),\s*minor:\s*(\d+),\s*patch:\s*(\d+),/mi);
				return version && checkVersion(this, version[1] + '.' + version[2] + '.' + version[3]);
			}
		},
		{
			name: 'Mootools',
			minVersions: [
				{ major: '1.2.', minor: '6' },
				{ major: '1.4.', minor: '5' },
				{ major: '1.5.', minor: '' }
			],
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/this.MooTools\s*=\s*\{version:\s*'(\d+\.\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'SWFObject',
			minVersions: [
				{ major: '2.', minor: '2' }
			],
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/\*\s+SWFObject v(\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery Form Plugin',
			minVersions: [
				{ major: '3.', minor: '22' }
			],
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/Form Plugin\s+\*\s+version: (\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'Modernizr',
			minVersions: [
				{ major: '2.5.', minor: '2' },
				{ major: '2.6.', minor: '2' },
				{ major: '2.7.', minor: '1' },
				{ major: '2.8.', minor: '3' }
			],
			check: function(checkVersion, scriptText) {
				// Static analysis. :(  The version is set as a local variable, far from
				// where Modernizr._version is set. Just see if we have a comment header.
				// ALT: look for /VAR="1.2.3"/ then for /._version=VAR/ ... ugh.
				var version = scriptText.match(/\*\s*Modernizr\s+(\d+\.\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery cookie',
			minVersions: [
				{ major: '1.3.', minor: '1' },
				{ major: '1.4.', minor: '1' }
			],
			patchOptional: false,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/\*\s*jQuery Cookie Plugin v(\d+\.\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'hoverIntent',
			minVersions: [
				{ major: '1.8.', minor: '1' }
			],
			patchOptional: false,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/\*\s*hoverIntent v(\d+\.\d+\.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery Easing',
			minVersions: [
				{ major: '1.3.', minor: '0' }
			],
			patchOptional: true,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/\*\s*jQuery Easing v(\d+\.\d+)\s*/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'underscore',
			minVersions: [
				{ major: '1.8.', minor: '3' },
				{ major: '1.7.', minor: '0' },
				{ major: '1.6.', minor: '0' },
				{ major: '1.5.', minor: '2' }

			],
			patchOptional: false,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/exports._(?:.*)?.VERSION="(\d+.\d+.\d+)"/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'hammer js',
			minVersions: [
				{ major: '2.0.', minor: '4' }
			],
			patchOptional: false,
			check: function(checkVersion, scriptText) {
				if (scriptText.indexOf('hammer.input') !== -1) {
					var version = scriptText.match(/.VERSION\s*=\s*['|"](\d+.\d+.\d+)['|"]/m);
					return version && checkVersion(this, version[1]);
				}

				return false;
			}
		},
		{
			name: 'jQuery Superfish',
			minVersions: [
				{ major: '1.7.', minor: '4' }
			],
			patchOptional: false,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/jQuery Superfish Menu Plugin - v(\d+.\d+.\d+)"/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery mousewheel',
			minVersions: [
				{ major: '3.1.', minor: '12' }
			],
			patchOptional: true,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/.mousewheel={version:"(\d+.\d+.\d+)/);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery mobile',
			minVersions: [
				{ major: '1.4.', minor: '5' },
				{ major: '1.3.', minor: '2' }
			],
			patchOptional: true,
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/.mobile,{version:"(\d+.\d+.\d+)/);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery UI',
			minVersions: [
				{ major: '1.8.', minor: '24' },
				{ major: '1.9.', minor: '2' },
				{ major: '1.10.', minor: '4' },
				{ major: '1.11.', minor: '4' }
			],
			check: function(checkVersion, scriptText) {
				var version = scriptText.match(/\.ui,[\s\r\n]*\{[\s\r\n]*version:\s*"(\d+.\d+.\d+)/m);
				return version && checkVersion(this, version[1]);
			}
		},
		{
			name: 'jQuery',
			minVersions: [
				{ major: '1.6.', minor: '4' },
				{ major: '1.7.', minor: '2' },
				{ major: '1.8.', minor: '2' },
				{ major: '1.9.', minor: '1' },
				{ major: '1.10.', minor: '2' },
				{ major: '1.11.', minor: '3' },
				{ major: '2.0.', minor: '3' },
				{ major: '2.1.', minor: '4' }
			],
			patchOptional: true,
			check: function(checkVersion, scriptText) {
				//We search the version in the header
				//Explanation: Some libraries have things like: Requires: jQuery v1.7.1 (cycle, for example)
				//We are matching regex that contain jQuery vx.y.z but do not have : right before jQuery
				var regex = /(?:jQuery\s*v)(\d+.\d+.\d+)\s/g;
				var regversion = regex.exec(scriptText);
				if (regversion) {
					var isPluginRegExp = new RegExp('(?::\\s*)' + regversion[0], 'g');

					if (!isPluginRegExp.exec(scriptText)) {
						return checkVersion(this, regversion[1]);
					}
				}

				var matchversion = scriptText.match(/jquery:\s*"([^"]+)/);
				if (matchversion) {
					return checkVersion(this, matchversion[1]);
				}

				//If header fails, we look with another pattern
				var regex = /(?:jquery[,\)].{0,200}=")(\d+\.\d+)(\..*?)"/gi;
				var results = regex.exec(scriptText);
				var version = results ? (results[1] + (results[2] || '')) : null;

				return version && checkVersion(this, version);
			}
		}
	];

    export var librariesVersions = <IScriptRule>{
        id: "webstandards.javascript-libraries-versions",
        title: "update javascript libraries",
        description: "The following libraries does not look up to date.",

        check: function(url: string, javascriptContent: string, rulecheck: any, analyseSummary: any) {
            rulecheck.items = rulecheck.items || [];
			var filecheck = null;
			
			
			if (!javascriptContent || url == "inline")
				return;

            for (var i = 0; i < libraries.length; i++) {
                var lib = libraries[i], result;

				result = lib.check.call(lib, this.checkVersion, javascriptContent);
				if (result && result.needsUpdate) {
					if (!filecheck){
						filecheck = {
							title : url,
							items : []
						}
						rulecheck.items.push(filecheck);
					}
					
					filecheck.items.push({
						title : "detected " + result.name + " version " + result.version,						
					});
					
					rulecheck.failed = true;
					
					break;
				}

            }
        },

		checkVersion: function(library, version) {

			var vinfo = {
				name: library.name,
				needsUpdate: true,
				minVersion: library.minVersions[0].major + library.minVersions[0].minor,
				version: version,
				bannedVersion : null
			};

			if (library.patchOptional) {
				// If lib can have an implied ".0", add it when needed
				// match 1.17, 1.17b2, 1.17-beta2; not 1.17.0, 1.17.2, 1.17b2
				var parts = version.match(/^(\d+\.\d+)(.*)$/);
				if (parts && !/^\.\d+/.test(parts[2])) {
					version = parts[1] + '.0' + parts[2];
				}
			}

			for (var i = 0; i < library.minVersions.length; i++) {
				var gv = library.minVersions[i];
				if (version.indexOf(gv.major) === 0) {
					vinfo.minVersion = gv.major + gv.minor;
					vinfo.needsUpdate = +version.slice(gv.major.length) < +gv.minor;
					break;
				}
			}

			if (library.bannedVersions) {
				if (library.bannedVersions.indexOf(version) >= 0) {
					vinfo.bannedVersion = version;
					vinfo.needsUpdate = true;
				}
			}

			return vinfo;
		}
    }
}
