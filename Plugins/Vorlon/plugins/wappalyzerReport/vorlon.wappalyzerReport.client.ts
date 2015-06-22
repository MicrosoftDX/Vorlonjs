﻿module VORLON {
    var WappalyzerAppsJSON = {
        "apps": {
            "1C-Bitrix": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "BITRIX_",
                    "X-Powered-CMS": "Bitrix Site Manager"
                },
                "html": "(?:<link[^>]+components/bitrix|(?:src|href)=\"/bitrix/(?:js|templates))",
                "implies": "PHP",
                "script": "1c-bitrix",
                "website": "www.1c-bitrix.ru"
            },
            "1und1": {
                "cats": [
                    6
                ],
                "implies": "PHP",
                "url": "/shop/catalog/browse\\?sessid=",
                "website": "1und1.de"
            },
            "2z Project": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "2z project ([\\d.]+)\\;version:\\1"
                },
                "website": "2zproject-cms.ru"
            },
            "3DM": {
                "cats": [
                    19
                ],
                "html": "<title>3ware 3DM([\\d\\.]+)?\\;version:\\1",
                "implies": "3ware",
                "website": "www.3ware.com"
            },
            "3dCart": {
                "cats": [
                    1,
                    6
                ],
                "headers": {
                    "Set-Cookie": "3dvisit",
                    "X-Powered-By": "3DCART"
                },
                "script": "(?:twlh(?:track)?\\.asp|3d_upsell\\.js)",
                "website": "www.3dcart.com"
            },
            "3ware": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "3ware\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "www.3ware.com"
            },
            "AMPcms": {
                "cats": [
                    1
                ],
                "env": "^amp_js_init$",
                "headers": {
                    "Set-Cookie": "^AMP=",
                    "X-AMP-Version": "([\\d.]+)\\;version:\\1"
                },
                "implies": "PHP",
                "website": "www.ampcms.org"
            },
            "AOLserver": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "AOLserver/?([\\d.]+)?\\;version:\\1"
                },
                "website": "aolserver.com"
            },
            "AT Internet Analyzer": {
                "cats": [
                    10
                ],
                "env": "^xtsite$",
                "website": "atinternet.com/en"
            },
            "AT Internet XiTi": {
                "cats": [
                    10
                ],
                "env": "^Xt_",
                "script": "xiti\\.com/hit\\.xiti",
                "website": "atinternet.com/en"
            },
            "ATEN": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "ATEN HTTP Server(?:\\(?V?([\\d\\.]+)\\)?)?\\;version:\\1"
                },
                "website": "www.aten.com"
            },
            "ATG Web Commerce": {
                "cats": [
                    6
                ],
                "headers": {
                    "X-ATG-Version": "(?:ATGPlatform/([\\d.]+))?\\;version:\\1"
                },
                "html": "<[^>]+_DARGS",
                "website": "oracle.com/us/products/applications/web-commerce/atg"
            },
            "AWStats": {
                "cats": [
                    10
                ],
                "implies": "Perl",
                "meta": {
                    "generator": "AWStats ([\\d.]+(?: \\(build [\\d.]+\\))?)\\;version:\\1"
                },
                "website": "awstats.sourceforge.net"
            },
            "Accessible Portal": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "Accessible Portal"
                },
                "website": "www.accessibleportal.com"
            },
            "AdInfinity": {
                "cats": [
                    36
                ],
                "script": "adinfinity\\.com\\.au",
                "website": "adinfinity.com.au"
            },
            "AdRiver": {
                "cats": [
                    36
                ],
                "env": "^adriver$",
                "html": "(?:<embed[^>]+(?:src=\"https?://mh\\d?\\.adriver\\.ru/|flashvars=\"[^\"]*(?:http:%3A//(?:ad|mh\\d?)\\.adriver\\.ru/|adriver_banner))|<(?:(?:iframe|img)[^>]+src|a[^>]+href)=\"https?://ad\\.adriver\\.ru/)",
                "script": "(?:adriver\\.core\\.\\d\\.js|https?://(?:content|ad|masterh\\d)\\.adriver\\.ru/)",
                "website": "adriver.ru"
            },
            "AdRoll": {
                "cats": [
                    36
                ],
                "env": "^adroll_",
                "script": "(?:a|s)\\.adroll\\.com",
                "website": "adroll.com"
            },
            "Adcash": {
                "cats": [
                    36
                ],
                "env": "^(?:ac_bgclick_URL|ct_(?:siteunder|tag|n(?:SuUrl(?:Opp)?)|Su(?:Loaded|Url)))$",
                "script": "^[^\\/]*//(?:[^\\/]+\\.)?adcash\\.com/(?:script|ad)/",
                "url": "^https?://(?:[^\\/]+\\.)?adcash\\.com/script/pop_",
                "website": "adcash.com"
            },
            "AddShoppers": {
                "cats": [
                    5
                ],
                "script": "cdn\\.shop\\.pe/widget/",
                "website": "www.addshoppers.com"
            },
            "AddThis": {
                "cats": [
                    5
                ],
                "env": "^addthis",
                "script": "addthis\\.com/js/",
                "website": "www.addthis.com"
            },
            "Adobe CQ5": {
                "cats": [
                    1
                ],
                "html": [
                    "<div class=\"[^\"]*parbase",
                    "<div[^>]+data-component-path=\"[^\"+]jcr:"
                ],
                "implies": "Java",
                "script": "/etc/designs/",
                "website": "adobe.com/products/cq.html"
            },
            "Adobe ColdFusion": {
                "cats": [
                    18
                ],
                "env": "^_cfEmails$",
                "headers": {
                    "Cookie": "CFTOKEN="
                },
                "html": "<!-- START headerTags\\.cfm",
                "implies": "CFML",
                "script": "/cfajax/",
                "url": "\\.cfm(?:$|\\?)",
                "website": "adobe.com/products/coldfusion-family.html"
            },
            "Adobe GoLive": {
                "cats": [
                    20
                ],
                "meta": {
                    "generator": "Adobe GoLive(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "website": "www.adobe.com/products/golive"
            },
            "Adobe Muse": {
                "cats": [
                    20
                ],
                "meta": {
                    "generator": "^Muse(?:$| ?/?(\\d[\\d.]+))\\;version:\\1"
                },
                "website": "muse.adobe.com"
            },
            "Adobe RoboHelp": {
                "cats": [
                    4
                ],
                "env": "^gbWh(?:Ver|Lang|Msg|Util|Proxy)$",
                "meta": {
                    "generator": "^Adobe RoboHelp(?: ([\\d]+))?\\;version:\\1"
                },
                "script": "(?:wh(?:utils|ver|proxy|lang|topic|msg)|ehlpdhtm)\\.js",
                "website": "adobe.com/products/robohelp.html"
            },
            "Advanced Web Stats": {
                "cats": [
                    10
                ],
                "html": "aws\\.src = [^<]+caphyon-analytics",
                "implies": "Java",
                "website": "www.advancedwebstats.com"
            },
            "Advert Stream": {
                "cats": [
                    36
                ],
                "env": "^advst_is_above_the_fold$",
                "script": "(?:ad\\.advertstream\\.com|adxcore\\.com)",
                "website": "www.advertstream.com"
            },
            "Adzerk": {
                "cats": [
                    36
                ],
                "env": "^ados(?:Results)?$",
                "html": "<iframe [^>]*src=\"[^\"]+adzerk\\.net",
                "script": "adzerk\\.net/ados\\.js",
                "website": "adzerk.com"
            },
            "Airee": {
                "cats": [
                    31
                ],
                "headers": {
                    "Server": "Airee"
                },
                "website": "xn--80aqc2a.xn--p1ai"
            },
            "Akamai": {
                "cats": [
                    31
                ],
                "headers": {
                    "X-Akamai-Transformed": ""
                },
                "website": "akamai.com"
            },
            "Algolia Realtime Search": {
                "cats": [
                    29
                ],
                "env": "^AlgoliaSearch$",
                "website": "www.algolia.com"
            },
            "Allegro RomPager": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Allegro-Software-RomPager(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "allegrosoft.com/embedded-web-server-s2"
            },
            "AlloyUI": {
                "cats": [
                    12
                ],
                "env": "^AUI$",
                "implies": [
                    "Twitter Bootstrap",
                    "YUI"
                ],
                "script": "^https?://cdn\\.alloyui\\.com/",
                "website": "www.alloyui.com"
            },
            "Amaya": {
                "cats": [
                    20
                ],
                "meta": {
                    "generator": "Amaya(?: V?([\\d.]+[a-z]))?\\;version:\\1"
                },
                "website": "www.w3.org/Amaya"
            },
            "Ametys": {
                "cats": [
                    1
                ],
                "implies": "Java",
                "meta": {
                    "generator": "(?:Ametys|Anyware Technologies)"
                },
                "script": "ametys\\.js",
                "website": "ametys.org"
            },
            "Amiro.CMS": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "Amiro"
                },
                "website": "amirocms.com"
            },
            "Anchor CMS": {
                "cats": [
                    1,
                    11
                ],
                "implies": [
                    "PHP",
                    "MySQL"
                ],
                "meta": {
                    "generator": "Anchor CMS"
                },
                "website": "anchorcms.com"
            },
            "AngularJS": {
                "cats": [
                    12
                ],
                "env": "^angular$",
                "script": [
                    "angular(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "/([\\d.]+(\\-?rc[.\\d]*)*)/angular(\\.min)?\\.js\\;version:\\1",
                    "angular.*\\.js"
                ],
                "website": "angularjs.org"
            },
            "Apache": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "(?:Apache(?:$|/([\\d.]+)|[^/-])|(?:^|\b)HTTPD)\\;version:\\1"
                },
                "website": "apache.org"
            },
            "Apache HBase": {
                "cats": [
                    34
                ],
                "html": "<style[^>]+static/hbase",
                "website": "hbase.apache.org"
            },
            "Apache Hadoop": {
                "cats": [
                    34
                ],
                "html": "<style[^>]+static/hadoop",
                "website": "hadoop.apache.org"
            },
            "Apache JSPWiki": {
                "cats": [
                    8
                ],
                "html": "<html[^>]* xmlns:jspwiki=",
                "script": "jspwiki",
                "url": "wiki\\.jsp",
                "website": "jspwiki.org"
            },
            "Apache Tomcat": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Apache-Coyote(/1\\.1)?\\;version:\\1?4.1+:",
                    "X-Powered-By": "\bTomcat\b(?:-([\\d.]+))?\\;version:\\1"
                },
                "website": "tomcat.apache.org"
            },
            "Apache Traffic Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "ATS/?([\\d.]+)?\\;version:\\1"
                },
                "website": "trafficserver.apache.org/"
            },
            "Apache Wicket": {
                "cats": [
                    18
                ],
                "env": "^Wicket",
                "implies": "Java",
                "website": "wicket.apache.org"
            },
            "AppNexus": {
                "cats": [
                    36
                ],
                "html": "<(?:iframe|img)[^>]+adnxs\\.(?:net|com)",
                "script": "adnxs\\.(?:net|com)",
                "website": "appnexus.com"
            },
            "Arc Forum": {
                "cats": [
                    2
                ],
                "html": "ping\\.src = node\\.href;\\s+[^>]+\\s+}\\s+</script>",
                "website": "arclanguage.org"
            },
            "Artifactory": {
                "cats": [
                    47
                ],
                "env": "^ArtifactoryUpdates$",
                "html": [
                    "<span class=\"version\">Artifactory(?: Pro)?(?: Power Pack)?(?: ([\\d.]+))?\\;version:\\1"
                ],
                "script": [
                    "wicket/resource/org\\.artifactory\\."
                ],
                "website": "jfrog.com/open-source/#os-arti"
            },
            "Artifactory Web Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Artifactory(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Artifactory"
                ],
                "website": "jfrog.com/open-source/#os-arti"
            },
            "AsciiDoc": {
                "cats": [
                    1,
                    20,
                    27
                ],
                "env": "^asciidoc$",
                "meta": {
                    "generator": "^AsciiDoc ([\\d.]+)\\;version:\\1"
                },
                "website": "www.methods.co.nz/asciidoc"
            },
            "Atlassian Bitbucket": {
                "cats": [
                    47
                ],
                "env": "^bitbucket$",
                "meta": {
                    "application-name": "Bitbucket"
                },
                "website": "www.atlassian.com/software/bitbucket/overview/"
            },
            "Atlassian Confluence": {
                "cats": [
                    8
                ],
                "headers": {
                    "X-Confluence-Request-Time": ""
                },
                "html": "Powered by <a href=[^>]+atlassian\\.com/software/confluence(?:[^>]+>Atlassian Confluence</a> ([\\d.]+))?\\;version:\\1",
                "implies": "Java",
                "meta": {
                    "confluence-request-time": ""
                },
                "website": "www.atlassian.com/software/confluence/overview/team-collaboration-software"
            },
            "Atlassian FishEye": {
                "cats": [
                    47
                ],
                "headers": {
                    "Set-cookie": "FESESSIONID"
                },
                "html": "<title>(?:Log in to )?FishEye (?:and Crucible )?([\\d.]+)?</title>\\;version:\\1",
                "website": "www.atlassian.com/software/fisheyet/overview/"
            },
            "Atlassian Jira": {
                "cats": [
                    13
                ],
                "env": "^jira$",
                "html": "Powered by\\s+<a href=[^>]+atlassian\\.com/(?:software/jira|jira-bug-tracking/)[^>]+>Atlassian\\s+JIRA(?:[^v]*v(?:ersion: )?(\\d+\\.\\d+(\\.\\d+)?))?\\;version:\\1",
                "implies": "Java",
                "meta": {
                    "ajs-version-number": "([\\d\\.]+)\\;version:\\1",
                    "application-name": "JIRA"
                },
                "website": "www.atlassian.com/software/jira/overview/"
            },
            "Atlassian Jira Issue Collector": {
                "cats": [
                    13,
                    47
                ],
                "script": [
                    "jira-issue-collector-plugin",
                    "atlassian\\.jira\\.collector\\.plugin"
                ],
                "website": "www.atlassian.com/software/jira/overview/"
            },
            "Avangate": {
                "cats": [
                    6
                ],
                "env": "^(?:__)?avng8_",
                "html": "<link[^>]* href=\"^https?://edge\\.avangate\\.net/",
                "script": "^https?://edge\\.avangate\\.net/",
                "website": "avangate.com"
            },
            "BIGACE": {
                "cats": [
                    1
                ],
                "html": "(?:Powered by <a href=\"[^>]+BIGACE|<!--\\s+Site is running BIGACE)",
                "implies": "PHP",
                "meta": {
                    "generator": "BIGACE ([\\d.]+)\\;version:\\1"
                },
                "website": "bigace.de"
            },
            "Backbone.js": {
                "cats": [
                    12
                ],
                "env": "^Backbone$",
                "implies": "Underscore.js",
                "script": "backbone.*\\.js",
                "website": "documentcloud.github.com/backbone"
            },
            "Backdrop": {
                "cats": [
                    1
                ],
                "env": "^Backdrop$",
                "excludes": "Drupal",
                "implies": "PHP",
                "meta": {
                    "generator": "Backdrop CMS(?: (\\d))?\\;version:\\1"
                },
                "website": "backdropcms.org"
            },
            "Banshee": {
                "cats": [
                    1,
                    18
                ],
                "html": "Built upon the <a href=\"[^>]+banshee-php\\.org/\">[a-z]+</a>(?:v([\\d.]+))?\\;version:\\1",
                "implies": "PHP",
                "meta": {
                    "generator": "Banshee PHP"
                },
                "website": "www.banshee-php.org"
            },
            "BaseHTTP": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "BaseHTTP\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "implies": "Python",
                "website": "docs.python.org/2/library/basehttpserver.html"
            },
            "BigDump": {
                "cats": [
                    3
                ],
                "html": "<!-- <h1>BigDump: Staggered MySQL Dump Importer ver\\. ([\\d.b]+)\\;version:\\1",
                "implies": [
                    "MySQL",
                    "PHP"
                ],
                "website": "www.ozerov.de/bigdump.php"
            },
            "Bigcommerce": {
                "cats": [
                    6
                ],
                "env": "^compareProducts$",
                "html": "<link href=[^>]+cdn\\d+\\.bigcommerce\\.com/v",
                "script": "cdn\\d+\\.bigcommerce\\.com/v",
                "url": "mybigcommerce\\.com",
                "website": "www.bigcommerce.com"
            },
            "Bigware": {
                "cats": [
                    6
                ],
                "headers": {
                    "Set-Cookie": "(?:bigwareCsid|bigWAdminID)"
                },
                "html": "(?:Diese <a href=[^>]+bigware\\.de|<a href=[^>]+/main_bigware_\\d+\\.php)",
                "implies": "PHP",
                "url": "(?:\\?|&)bigWAdminID=",
                "website": "bigware.de"
            },
            "BittAds": {
                "cats": [
                    36
                ],
                "env": "^bitt$",
                "script": "bittads\\.com/js/bitt\\.js$",
                "website": "bittads.com"
            },
            "Blip.tv": {
                "cats": [
                    14
                ],
                "html": "<(?:param|embed|iframe)[^>]+blip\\.tv/play",
                "website": "blip.tv"
            },
            "Blogger": {
                "cats": [
                    11
                ],
                "meta": {
                    "generator": "blogger"
                },
                "url": "\\.blogspot\\.com",
                "website": "www.blogger.com"
            },
            "Bluefish": {
                "cats": [
                    20
                ],
                "meta": {
                    "generator": "Bluefish(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "website": "sourceforge.net/projects/bluefish"
            },
            "Boa": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Boa\\/?([\\d\\.a-z]+)?\\;version:\\1"
                },
                "website": "www.boa.org"
            },
            "Boba.js": {
                "cats": [
                    12
                ],
                "implies": "Google Analytics",
                "script": "boba(\\.min)?\\.js",
                "website": "boba.space150.com"
            },
            "Bolt": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "Bolt"
                },
                "website": "bolt.cm"
            },
            "Bonfire": {
                "cats": [
                    18
                ],
                "headers": {
                    "Set-Cookie": "bf_session="
                },
                "html": "Powered by <a[^>]+href=\"https?://(?:www\\.)?cibonfire\\.com[^>]*>Bonfire v([^<]+)\\;version:\\1",
                "implies": "CodeIgniter",
                "website": "cibonfire.com"
            },
            "Brother": {
                "cats": [
                    40
                ],
                "website": "www.brother.com"
            },
            "BrowserCMS": {
                "cats": [
                    1
                ],
                "implies": "Ruby",
                "meta": {
                    "generator": "BrowserCMS ([\\d.]+)\\;version:\\1"
                },
                "website": "browsercms.org"
            },
            "BugSense": {
                "cats": [
                    10
                ],
                "env": "^BugSense$",
                "script": "bugsense\\.js",
                "website": "bugsense.com"
            },
            "BugSnag": {
                "cats": [
                    10
                ],
                "env": "^BugSnag$",
                "script": "bugsnag.*\\.js",
                "website": "bugsnag.com"
            },
            "Bugzilla": {
                "cats": [
                    13
                ],
                "html": "href=\"enter_bug\\.cgi\">",
                "implies": "Perl",
                "website": "www.bugzilla.org"
            },
            "Burning Board": {
                "cats": [
                    2
                ],
                "html": "<a href=\"[^>]+woltlab\\.com[^<]+<strong>Burning Board",
                "implies": "PHP",
                "website": "www.woltlab.com"
            },
            "Business Catalyst": {
                "cats": [
                    1
                ],
                "html": "<!-- BC_OBNW -->",
                "script": "CatalystScripts",
                "website": "businesscatalyst.com"
            },
            "BuySellAds": {
                "cats": [
                    36
                ],
                "env": "^_bsa",
                "html": "<script[^>]*>[^<]+?bsa.src\\s*=\\s*['\"](?:https?:)?\\/{2}\\w\\d\\.buysellads\\.com\\/[\\w\\d\\/]+?bsa\\.js['\"]",
                "script": "^https?://s\\d\\.buysellads\\.com/",
                "website": "buysellads.com"
            },
            "C++": {
                "cats": [
                    27
                ],
                "website": "isocpp.org"
            },
            "CFML": {
                "cats": [
                    27
                ],
                "website": "adobe.com/products/coldfusion-family.html"
            },
            "CKEditor": {
                "cats": [
                    24
                ],
                "env": "^CKEDITOR$",
                "website": "ckeditor.com"
            },
            "CMS Made Simple": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "^CMSSESSID"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "CMS Made Simple"
                },
                "website": "cmsmadesimple.org"
            },
            "CMSimple": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "CMSimple( [\\d.]+)?\\;version:\\1"
                },
                "website": "www.cmsimple.org/en"
            },
            "CO2Stats": {
                "cats": [
                    10
                ],
                "html": "src=[^>]+co2stats\\.com/propres\\.php",
                "website": "co2stats.com"
            },
            "CPG Dragonfly": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "Dragonfly CMS"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "CPG Dragonfly"
                },
                "website": "dragonflycms.org"
            },
            "CS Cart": {
                "cats": [
                    6
                ],
                "env": "^fn_compare_strings$",
                "html": [
                    "&nbsp;Powered by (?:<a href=[^>]+cs-cart\\.com|CS-Cart)",
                    ".cm-noscript[^>]+</style>"
                ],
                "implies": "PHP",
                "website": "www.cs-cart.com"
            },
            "CacheFly": {
                "cats": [
                    31
                ],
                "headers": {
                    "Server": "^CFS ",
                    "X-CF1": "",
                    "X-CF2": ""
                },
                "website": "www.cachefly.com"
            },
            "CakePHP": {
                "cats": [
                    18
                ],
                "headers": {
                    "Set-Cookie": "cakephp="
                },
                "implies": "PHP",
                "meta": {
                    "application-name": "CakePHP"
                },
                "website": "cakephp.org"
            },
            "Canon": {
                "cats": [
                    40
                ],
                "website": "www.canon.com"
            },
            "Canon HTTP Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "CANON HTTP Server(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Canon"
                ],
                "website": "www.canon.com"
            },
            "Carbon Ads": {
                "cats": [
                    36
                ],
                "env": "^_carbonads",
                "html": "<[a-z]+ [^>]*id=\"carbonads-container\"",
                "script": "[^\\/]*\\/\\/(?:engine|srv)\\.carbonads\\.com\\/",
                "website": "carbonads.net"
            },
            "Cargo": {
                "cats": [
                    1
                ],
                "html": "<link [^>]+Cargo feed",
                "implies": "PHP",
                "meta": {
                    "cargo_title": ""
                },
                "script": "/cargo\\.",
                "website": "cargocollective.com"
            },
            "Catberry.js": {
                "cats": [
                    12,
                    18
                ],
                "env": "^catberry$",
                "headers": {
                    "X-Powered-By": "Catberry"
                },
                "implies": "node.js",
                "website": "catberry.org"
            },
            "Catwalk": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Catwalk\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "implies": "Canon",
                "website": "www.canon.com"
            },
            "CentOS": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "CentOS",
                    "X-Powered-By": "CentOS"
                },
                "website": "centos.org"
            },
            "CenteHTTPd": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "CenteHTTPd(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "cente.jp/cente/app/HTTPdc.html"
            },
            "Chameleon": {
                "cats": [
                    1
                ],
                "implies": [
                    "Apache",
                    "PHP"
                ],
                "meta": {
                    "generator": "chameleon-cms"
                },
                "website": "chameleon-system.de"
            },
            "Chamilo": {
                "cats": [
                    21
                ],
                "headers": {
                    "X-Powered-By": "Chamilo ([\\d.]+)\\;version:\\1"
                },
                "html": "\">Chamilo ([\\d.]+)</a>\\;version:\\1",
                "implies": "PHP",
                "meta": {
                    "generator": "Chamilo ([\\d.]+)\\;version:\\1"
                },
                "website": "www.chamilo.org"
            },
            "Chartbeat": {
                "cats": [
                    10
                ],
                "env": "^_sf_(?:endpt|async_config)$",
                "script": "chartbeat\\.js",
                "website": "chartbeat.com"
            },
            "Cherokee": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Cherokee/([\\d.]+)\\;version:\\1"
                },
                "website": "www.cherokee-project.com"
            },
            "CherryPy": {
                "cats": [
                    18,
                    22
                ],
                "headers": {
                    "Server": "CherryPy\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "implies": "Python",
                "website": "www.cherrypy.org"
            },
            "Chitika": {
                "cats": [
                    36
                ],
                "env": "ch_c(?:lient|olor_site_link)",
                "script": "scripts\\.chitika\\.net/",
                "website": "chitika.com"
            },
            "Ckan": {
                "cats": [
                    1
                ],
                "headers": {
                    "Access-Control-Allow-Headers": "X-CKAN-API-KEY",
                    "Link": "<http://ckan.org/>; rel=shortlink"
                },
                "implies": [
                    "Python",
                    "Solr",
                    "Java",
                    "PostgreSQL\\;confidence:80"
                ],
                "website": "ckan.org/"
            },
            "ClickHeat": {
                "cats": [
                    10
                ],
                "env": "^clickHeat",
                "implies": "PHP",
                "script": "clickheat.*\\.js",
                "website": "www.labsmedia.com/clickheat/index.html"
            },
            "ClickTale": {
                "cats": [
                    10
                ],
                "env": "^ClickTale",
                "website": "www.clicktale.com"
            },
            "Clicky": {
                "cats": [
                    10
                ],
                "env": "^clicky$",
                "script": "static\\.getclicky\\.com",
                "website": "getclicky.com"
            },
            "CloudFlare": {
                "cats": [
                    31
                ],
                "env": "^CloudFlare$",
                "headers": {
                    "Server": "cloudflare"
                },
                "website": "www.cloudflare.com"
            },
            "Cloudera": {
                "cats": [
                    34
                ],
                "headers": {
                    "Server": "cloudera"
                },
                "website": "www.cloudera.com"
            },
            "CodeIgniter": {
                "cats": [
                    18
                ],
                "headers": {
                    "Set-Cookie": "(?:exp_last_activity|exp_tracker|ci_(?:session|(csrf_token)))\\;version:\\1?2+:"
                },
                "html": "<input[^>]+name=\"ci_csrf_token\"\\;version:2+",
                "implies": "PHP",
                "website": "codeigniter.com"
            },
            "CodeMirror": {
                "cats": [
                    19
                ],
                "env": "^CodeMirror$",
                "website": "codemirror.net"
            },
            "Commerce Server": {
                "cats": [
                    6
                ],
                "headers": {
                    "COMMERCE-SERVER-SOFTWARE": ""
                },
                "implies": "Microsoft ASP.NET",
                "website": "commerceserver.net"
            },
            "CompaqHTTPServer": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "CompaqHTTPServer\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "www.hp.com"
            },
            "Concrete5": {
                "cats": [
                    1
                ],
                "env": "^CCM_IMAGE_PATH$",
                "implies": "PHP",
                "meta": {
                    "generator": "concrete5 - ([\\d.ab]+)\\;version:\\1"
                },
                "script": "concrete/js/",
                "website": "concrete5.org"
            },
            "Connect": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "^Connect$"
                },
                "implies": "node.js",
                "website": "www.senchalabs.org/connect"
            },
            "Contao": {
                "cats": [
                    1
                ],
                "html": [
                    "<!--[^>]+powered by (?:TYPOlight|Contao)[^>]*-->",
                    "<link[^>]+(?:typolight|contao)\\.css"
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "^Contao Open Source CMS$"
                },
                "website": "contao.org"
            },
            "Contenido": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "Contenido ([\\d.]+)\\;version:\\1"
                },
                "website": "contenido.org/en"
            },
            "Contens": {
                "cats": [
                    1
                ],
                "implies": [
                    "Java",
                    "CFML"
                ],
                "meta": {
                    "generator": "Contensis CMS Version ([\\d.]+)\\;version:\\1"
                },
                "website": "www.contens.com/en/pub/index.cfm"
            },
            "ContentBox": {
                "cats": [
                    1,
                    11
                ],
                "implies": "Adobe ColdFusion",
                "meta": {
                    "generator": "ContentBox powered by ColdBox"
                },
                "website": "www.gocontentbox.org"
            },
            "ConversionLab": {
                "cats": [
                    10
                ],
                "script": "conversionlab\\.trackset\\.com/track/tsend\\.js",
                "website": "www.trackset.it/conversionlab"
            },
            "Coppermine": {
                "cats": [
                    7
                ],
                "html": "<!--Coppermine Photo Gallery ([\\d.]+)\\;version:\\1",
                "implies": "PHP",
                "website": "coppermine-gallery.net"
            },
            "Cosmoshop": {
                "cats": [
                    6
                ],
                "script": "cosmoshop_functions\\.js",
                "website": "cosmoshop.de"
            },
            "Cotonti": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "Cotonti"
                },
                "website": "www.cotonti.com"
            },
            "CouchDB": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "CouchDB/([\\d.]+)\\;version:\\1"
                },
                "website": "couchdb.apache.org"
            },
            "Cowboy": {
                "cats": [
                    18,
                    22
                ],
                "headers": {
                    "Server": "Cowboy"
                },
                "implies": "Erlang",
                "website": "ninenines.eu"
            },
            "CppCMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "CppCMS/([\\d.]+)\\;version:\\1"
                },
                "implies": "C++",
                "website": "cppcms.com"
            },
            "Craft CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "CraftSessionId=",
                    "X-Powered-By": "Craft CMS"
                },
                "implies": "PHP",
                "website": "buildwithcraft.com"
            },
            "Crazy Egg": {
                "cats": [
                    10
                ],
                "env": "^CE2$",
                "script": "cetrk\\.com/pages/scripts/\\d+/\\d+\\.js",
                "website": "crazyegg.com"
            },
            "Criteo": {
                "cats": [
                    36
                ],
                "env": "^criteo",
                "script": "[^/]*//(?:cas\\.criteo\\.com|(?:[^/]\\.)?criteo\\.net)/",
                "website": "criteo.com"
            },
            "Cross Pixel": {
                "cats": [
                    10
                ],
                "env": "^crsspxl$",
                "script": "tag\\.crsspxl\\.com/s1\\.js",
                "website": "datadesk.crsspxl.com"
            },
            "CubeCart": {
                "cats": [
                    6
                ],
                "html": "(?:Powered by <a href=[^>]+cubecart\\.com|<p[^>]+>Powered by CubeCart)",
                "implies": "PHP",
                "meta": {
                    "generator": "cubecart"
                },
                "website": "www.cubecart.com"
            },
            "Cufon": {
                "cats": [
                    17
                ],
                "env": "^Cufon$",
                "script": "cufon-yui\\.js",
                "website": "cufon.shoqolate.com"
            },
            "D3": {
                "cats": [
                    25
                ],
                "env": "^d3$",
                "script": "d3(?:\\. v\\d+)?(?:\\.min)?\\.js",
                "website": "d3js.org"
            },
            "DHTMLX": {
                "cats": [
                    12
                ],
                "script": "dhtmlxcommon\\.js",
                "website": "dhtmlx.com"
            },
            "Discuz! X": {
                "cats": [
                    2
                ],
                "meta": {
                    "generator": "Discuz! X([\\d\\.]+)?\\;version:\\1"
                },
                "env": [
                    "^discuz_uid$",
                    "^DISCUZCODE$"
                ],
                "implies": "PHP",
                "website": "discuz.com"
            },
            "DTG": {
                "cats": [
                    1
                ],
                "html": [
                    "<a[^>]+Site Powered by DTG"
                ],
                "implies": "Mono.net",
                "website": "www.dtg.nl"
            },
            "Dancer": {
                "cats": [
                    18
                ],
                "headers": {
                    "Server": "Perl Dancer ([\\d.]+)\\;version:\\1",
                    "X-Powered-By": "Perl Dancer ([\\d.]+)\\;version:\\1"
                },
                "implies": "Perl",
                "website": "perldancer.org"
            },
            "Danneo CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "CMS Danneo ([\\d.]+)\\;version:\\1"
                },
                "implies": [
                    "Apache",
                    "PHP"
                ],
                "meta": {
                    "generator": "Danneo CMS ([\\d.]+)\\;version:\\1"
                },
                "website": "danneo.com"
            },
            "Darwin": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Darwin",
                    "X-Powered-By": "Darwin"
                },
                "website": "opensource.apple.com"
            },
            "DataLife Engine": {
                "cats": [
                    1
                ],
                "env": "^dle_root$",
                "implies": [
                    "PHP",
                    "Apache"
                ],
                "meta": {
                    "generator": "DataLife Engine"
                },
                "website": "dle-news.ru"
            },
            "David Webbox": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "David-WebBox/([\\d.a]+ \\(\\d+\\))\\;version:\\1"
                },
                "website": "www.tobit.com"
            },
            "Debian": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Debian",
                    "X-Powered-By": "(?:Debian|dotdeb|(sarge|etch|lenny|squeeze|wheezy|jessie))\\;version:\\1"
                },
                "website": "debian.org"
            },
            "Decorum": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "DECORUM(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "???"
            },
            "DedeCMS": {
                "cats": [
                    1
                ],
                "env": "^DedeContainer",
                "implies": "PHP",
                "script": "dedeajax",
                "website": "dedecms.com"
            },
            "Dell": {
                "cats": [
                    40
                ],
                "website": "dell.com"
            },
            "Demandware": {
                "cats": [
                    6
                ],
                "env": "^dwAnalytics$",
                "headers": {
                    "Server": "Demandware eCommerce Server"
                },
                "html": "<[^>]+demandware\\.edgesuite",
                "website": "demandware.com"
            },
            "Deployd": {
                "cats": [
                    12
                ],
                "env": "^dpd$",
                "script": "dpd\\.js",
                "website": "deployd.com"
            },
            "DirectAdmin": {
                "cats": [
                    9
                ],
                "headers": {
                    "Server": "DirectAdmin Daemon v([\\d.]+)\\;version:\\1"
                },
                "html": "<a[^>]+>DirectAdmin</a> Web Control Panel",
                "implies": [
                    "PHP",
                    "Apache"
                ],
                "website": "www.directadmin.com"
            },
            "Discourse": {
                "cats": [
                    2
                ],
                "env": "Discourse",
                "implies": [
                    "Ruby on Rails"
                ],
                "meta": {
                    "generator": "Discourse(?: ?/?([\\d.]+\\d))?\\;version:\\1"
                },
                "website": "discourse.org"
            },
            "Disqus": {
                "cats": [
                    15
                ],
                "env": "^DISQUS",
                "html": "<div[^>]+id=\"disqus_thread\"",
                "script": "disqus_url",
                "website": "disqus.com"
            },
            "Django": {
                "cats": [
                    18
                ],
                "env": "^__admin_media_prefix__",
                "html": "(?:powered by <a[^>]+>Django ?([\\d.]+)?|<input[^>]*name=[\"']csrfmiddlewaretoken[\"'][^>]*>)\\;version:\\1",
                "implies": "Python",
                "website": "djangoproject.com"
            },
            "Django CMS": {
                "cats": [
                    1
                ],
                "implies": "Django",
                "website": "django-cms.org"
            },
            "Dojo": {
                "cats": [
                    12
                ],
                "env": "^dojo$",
                "script": "([\\d.]+)/dojo/dojo(?:\\.xd)?\\.js\\;version:\\1",
                "website": "dojotoolkit.org"
            },
            "Dokeos": {
                "cats": [
                    21
                ],
                "headers": {
                    "X-Powered-By": "Dokeos"
                },
                "html": "(?:Portal <a[^>]+>Dokeos|@import \"[^\"]+dokeos_blue)",
                "implies": [
                    "PHP",
                    "Xajax",
                    "jQuery",
                    "CKEditor"
                ],
                "meta": {
                    "generator": "Dokeos"
                },
                "website": "dokeos.com"
            },
            "DokuWiki": {
                "cats": [
                    8
                ],
                "headers": {
                    "Set-Cookie": "DokuWiki="
                },
                "implies": "PHP",
                "meta": {
                    "generator": "DokuWiki( Release [\\-\\d]+)?\\;version:\\1"
                },
                "website": "www.dokuwiki.org"
            },
            "DNN": {
                "cats": [
                    1
                ],
                "env": "^DotNetNuke$",
                "headers": {
                    "DNNOutputCache": "",
                    "Cookie": "dnn_IsMobile=",
                    "Set-Cookie": "DotNetNukeAnonymous=",
                    "X-Compressed-By": "DotNetNuke"
                },
                "html": [
                    "<!-- by DotNetNuke Corporation",
                    "<!-- DNN Platform"
                ],
                "implies": "Microsoft ASP.NET",
                "meta": {
                    "generator": "DotNetNuke"
                },
                "script": [
                    "/js/dnncore\\.js",
                    "/js/dnn\\.js"
                ],
                "website": "dnnsoftware.com"
            },
            "Dotclear": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "website": "dotclear.org"
            },
            "Doxygen": {
                "cats": [
                    4
                ],
                "html": "(?:<!-- Generated by Doxygen ([\\d.]+)|<link[^>]+doxygen\\.css)\\;version:\\1",
                "meta": {
                    "generator": "Doxygen ([\\d.]+)\\;version:\\1"
                },
                "website": "stack.nl/~dimitri/doxygen"
            },
            "DreamWeaver": {
                "cats": [
                    20
                ],
                "html": "(?:<!--[^>]*(?:InstanceBeginEditable|Dreamweaver([^>]+)target|DWLayoutDefaultTable)|function MM_preloadImages\\(\\) \\{)\\;version:\\1",
                "website": "www.adobe.com/products/dreamweaver"
            },
            "Drupal": {
                "cats": [
                    1
                ],
                "env": "^Drupal$",
                "headers": {
                    "Expires": "19 Nov 1978",
                    "X-Drupal-Cache": "",
                    "X-Generator": "Drupal(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "html": "<(?:link|style)[^>]+sites/(?:default|all)/(?:themes|modules)/",
                "implies": "PHP",
                "meta": {
                    "generator": "Drupal(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "script": "drupal\\.js",
                "website": "drupal.org"
            },
            "Drupal Commerce": {
                "cats": [
                    6
                ],
                "html": "<[^]+(?:id=\"block[_-]commerce[_-]cart[_-]cart|class=\"commerce[_-]product[_-]field)",
                "implies": "Drupal",
                "website": "drupalcommerce.org"
            },
            "Dynamicweb": {
                "cats": [
                    1,
                    6,
                    10
                ],
                "headers": {
                    "Set-Cookie": "Dynamicweb="
                },
                "implies": "Microsoft ASP.NET",
                "meta": {
                    "generator": "Dynamicweb ([\\d.]+)\\;version:\\1"
                },
                "website": "www.dynamicweb.dk"
            },
            "E-Merchant": {
                "cats": [
                    6
                ],
                "script": "cdn\\.e-merchant\\.com",
                "website": "e-merchant.com"
            },
            "ELOG": {
                "cats": [
                    19
                ],
                "html": "<title>ELOG Logbook Selection</title>",
                "website": "midas.psi.ch/elog"
            },
            "ELOG HTTP": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "ELOG HTTP( \\d[\\-\\d\\.]+)?\\;version:\\1"
                },
                "implies": "ELOG",
                "website": "midas.psi.ch/elog"
            },
            "EPiServer": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "EPi(?:Trace|Server)[^;]*="
                },
                "implies": "Microsoft ASP.NET",
                "meta": {
                    "generator": "EPiServer"
                },
                "website": "episerver.com"
            },
            "EPrints": {
                "cats": [
                    19
                ],
                "env": "^EPJS_menu_template$",
                "implies": "Perl",
                "meta": {
                    "generator": "EPrints ([\\d.]+)\\;version:\\1"
                },
                "website": "www.eprints.org"
            },
            "ESERV-10": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "ESERV-10(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "www.violasystems.com"
            },
            "EWS-NIC4": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "EWS-NIC4(?:\\/([\\d\\.a-z]+))?\\;version:\\1"
                },
                "implies": "Dell",
                "website": "dell.com"
            },
            "EdgeCast": {
                "cats": [
                    31
                ],
                "headers": {
                    "Server": "^EC(?:S|Acc)"
                },
                "url": "https?://(?:[^/]+\\.)?edgecastcdn\\.net/",
                "website": "www.edgecast.com"
            },
            "Eleanor CMS": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "Eleanor"
                },
                "website": "eleanor-cms.ru"
            },
            "Elm": {
                "cats": [
                    27,
                    12
                ],
                "env": "^Elm$",
                "website": "elm-lang.org"
            },
            "Eloqua": {
                "cats": [
                    32
                ],
                "env": "^elq(?:SiteID|Load|CurESite)$",
                "script": "elqCfg\\.js",
                "website": "eloqua.com"
            },
            "EmbedThis Appweb": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Mbedthis-Appweb(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "embedthis.com/appweb"
            },
            "Embedthis-http": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Embedthis-http(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "github.com/embedthis/http"
            },
            "Ember.js": {
                "cats": [
                    12
                ],
                "env": "^Ember$",
                "implies": "Handlebars",
                "website": "emberjs.com"
            },
            "Enyo": {
                "cats": [
                    12,
                    26
                ],
                "env": "^enyo$",
                "script": "enyo\\.js",
                "website": "enyojs.com"
            },
            "Epoch": {
                "cats": [
                    25
                ],
                "html": "<link[^>]+?href=\"[^\"]+epoch(?:\\.min)?\\.css",
                "implies": "D3",
                "script": "epoch(\\.min)?\\.js",
                "website": "fastly.github.io/epoch"
            },
            "Epom": {
                "cats": [
                    36
                ],
                "env": "^Epom",
                "url": "^https?://(?:[^/]+\\.)?ad(?:op)?shost1\\.com/",
                "website": "epom.com"
            },
            "Erlang": {
                "cats": [
                    27
                ],
                "headers": {
                    "Server": "Erlang( OTP/([\\-\\d\\.ABR]+))?\\;version:\\1"
                },
                "website": "www.erlang.org"
            },
            "Exhibit": {
                "cats": [
                    25
                ],
                "env": "^Exhibit$",
                "script": "exhibit.*\\.js",
                "website": "simile-widgets.org/exhibit/"
            },
            "Express": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "^Express$"
                },
                "implies": "node.js",
                "website": "expressjs.com"
            },
            "ExpressionEngine": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "(?:exp_last_activity|exp_tracker)"
                },
                "implies": "PHP",
                "website": "expressionengine.com"
            },
            "ExtJS": {
                "cats": [
                    12
                ],
                "env": "^Ext$",
                "script": "ext-base\\.js",
                "website": "www.extjs.com"
            },
            "FAST ESP": {
                "cats": [
                    29
                ],
                "html": "<form[^>]+id=\"fastsearch\"",
                "website": "microsoft.com/enterprisesearch"
            },
            "FAST Search for SharePoint": {
                "cats": [
                    29
                ],
                "html": "<input[^>]+ name=\"ParametricSearch",
                "implies": [
                    "Microsoft SharePoint",
                    "Microsoft ASP.NET"
                ],
                "url": "Pages/SearchResults\\.aspx\\?k=",
                "website": "sharepoint.microsoft.com/en-us/product/capabilities/search/Pages/Fast-Search.aspx"
            },
            "FWP": {
                "cats": [
                    6
                ],
                "html": "<!--\\s+FwP Systems",
                "meta": {
                    "generator": "FWP Shop"
                },
                "website": "fwpshop.org"
            },
            "Fact Finder": {
                "cats": [
                    29
                ],
                "html": "<!-- Factfinder",
                "script": "Suggest\\.ff",
                "url": "(?:/ViewParametricSearch|ffsuggest\\.[a-z]htm)",
                "website": "fact-finder.com"
            },
            "Fat-Free Framework": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "Fat-Free Framework"
                },
                "implies": "PHP",
                "website": "fatfreeframework.com"
            },
            "Fedora": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Fedora"
                },
                "website": "fedoraproject.org"
            },
            "Fireblade": {
                "cats": [
                    31
                ],
                "headers": {
                    "Server": "fbs"
                },
                "website": "fireblade.com"
            },
            "FlashCom": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "FlashCom/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "???"
            },
            "Flask": {
                "cats": [
                    18,
                    22
                ],
                "headers": {
                    "Server": "Werkzeug/?([\\d\\.]+)?\\;version:\\1"
                },
                "implies": "Python",
                "website": "flask.pocoo.org"
            },
            "FlexCMP": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Flex-Lang": "",
                    "X-Powered-By": "FlexCMP.+\\[v\\. ([\\d.]+)\\;version:\\1"
                },
                "html": "<!--[^>]+FlexCMP[^>v]+v\\. ([\\d.]+)\\;version:\\1",
                "meta": {
                    "generator": "FlexCMP"
                },
                "website": "www.flexcmp.com/cms/home"
            },
            "FluxBB": {
                "cats": [
                    2
                ],
                "html": "Powered by (?:<strong>)?<a href=\"[^>]+fluxbb",
                "website": "fluxbb.org"
            },
            "Flyspray": {
                "cats": [
                    13
                ],
                "headers": {
                    "Set-Cookie": "flyspray_project="
                },
                "html": "(?:<a[^>]+>Powered by Flyspray|<map id=\"projectsearchform)",
                "website": "flyspray.org"
            },
            "Font Awesome": {
                "cats": [
                    17
                ],
                "html": "<link[^>]* href=[^>]+font-awesome(?:\\.min)?\\.css",
                "website": "fontawesome.io"
            },
            "Fortune3": {
                "cats": [
                    6
                ],
                "html": "(?:<link [^>]*href=\"[^\\/]*\\/\\/www\\.fortune3\\.com\\/[^\"]*siterate\\/rate\\.css|Powered by <a [^>]*href=\"[^\"]+fortune3\\.com)",
                "script": "cartjs\\.php\\?(?:.*&)?s=[^&]*myfortune3cart\\.com",
                "website": "fortune3.com"
            },
            "FreeBSD": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "FreeBSD(?: ([\\d.]+))?\\;version:\\1"
                },
                "website": "freebsd.org"
            },
            "FreeTextBox": {
                "cats": [
                    24
                ],
                "env": "^FTB_",
                "html": "/<!--\\s*\\*\\s*FreeTextBox v\\d+ \\(([.\\d]+)(?:(?:.|\n)+?<!--\\s*\\*\\s*License Type: (Distribution|Professional)License)?/i\\;version:\\1 \\2",
                "implies": "Microsoft ASP.NET",
                "website": "freetextbox.com"
            },
            "FrontPage": {
                "cats": [
                    20
                ],
                "html": "<html[^>]+urn:schemas-microsoft-com:office:office",
                "meta": {
                    "generator": "Microsoft FrontPage(?:\\s((?:Express )?[\\d.]+))?\\;version:\\1"
                },
                "website": "office.microsoft.com/frontpage"
            },
            "Fusion Ads": {
                "cats": [
                    36
                ],
                "env": "^_fusion",
                "script": "^[^\\/]*//[ac]dn\\.fusionads\\.net/(?:api/([\\d.]+)/)?\\;version:\\1",
                "website": "fusionads.net"
            },
            "G-WAN": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "G-WAN"
                },
                "website": "gwan.com"
            },
            "GX WebManager": {
                "cats": [
                    1
                ],
                "html": "<!--\\s+Powered by GX",
                "meta": {
                    "generator": "GX WebManager(?: ([\\d.]+))?\\;version:\\1"
                },
                "website": "www.gxsoftware.com/en/products/web-content-management.htm"
            },
            "Gallery": {
                "cats": [
                    7
                ],
                "env": "^galleryAuthToken$",
                "html": "<div id=\"gsNavBar\" class=\"gcBorder1\">",
                "website": "gallery.menalto.com"
            },
            "Gambio": {
                "cats": [
                    6
                ],
                "env": "^gm_session_id$",
                "html": "(?:<link[^>]* href=\"templates/gambio/|<a[^>]content\\.php\\?coID=\\d|<!-- gambio eof -->|<!--[\\s=]+Shopsoftware by Gambio GmbH \\(c\\))",
                "implies": "PHP",
                "script": "gm_javascript\\.js\\.php",
                "website": "gambio.de"
            },
            "Gauges": {
                "cats": [
                    10
                ],
                "env": "^_gauges$",
                "headers": {
                    "Set-Cookie": "_gauges_[^;]+="
                },
                "website": "get.gaug.es"
            },
            "Gentoo": {
                "cats": [
                    28
                ],
                "headers": {
                    "X-Powered-By": "gentoo"
                },
                "website": "www.gentoo.org"
            },
            "Get Satisfaction": {
                "cats": [
                    13
                ],
                "env": "^GSFN",
                "website": "getsatisfaction.com"
            },
            "GetSimple CMS": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "GetSimple"
                },
                "website": "get-simple.info"
            },
            "Ghost": {
                "cats": [
                    11
                ],
                "headers": {
                    "X-Ghost-Cache-Status": ""
                },
                "meta": {
                    "generator": "Ghost(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "website": "ghost.org"
            },
            "GitBook": {
                "cats": [
                    4
                ],
                "meta": {
                    "generator": "GitBook(?:.([\\d.]+))?\\;version:\\1"
                },
                "website": "gitbook.io"
            },
            "GitLab": {
                "cats": [
                    13,
                    47
                ],
                "headers": {
                    "Set-cookie": "_gitlab_session"
                },
                "implies": [
                    "Ruby",
                    "Ruby on Rails"
                ],
                "website": "about.gitlab.com"
            },
            "GitLab CI": {
                "cats": [
                    44,
                    47
                ],
                "implies": [
                    "Ruby",
                    "Ruby on Rails"
                ],
                "meta": {
                    "description": "GitLab Continuous Integration"
                },
                "website": "about.gitlab.com/gitlab-ci"
            },
            "GlassFish": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "GlassFish(?: Server)?(?: Open Source Edition)?(?: ?/?([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Java"
                ],
                "website": "glassfish.java.net"
            },
            "Glyphicons": {
                "cats": [
                    17
                ],
                "html": "(?:<link[^>]* href=[^>]+glyphicons(?:\\.min)?\\.css|<img[^>]* src=[^>]+glyphicons)",
                "website": "glyphicons.com"
            },
            "GoAhead": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "GoAhead"
                },
                "website": "embedthis.com/products/goahead/index.html"
            },
            "GoStats": {
                "cats": [
                    10
                ],
                "env": "^_go(?:stats|_track)",
                "website": "gostats.com"
            },
            "Google AdSense": {
                "cats": [
                    36
                ],
                "env": [
                    "^google_ad_",
                    "^__google_ad_",
                    "^Goog_AdSense_"
                ],
                "script": [
                    "googlesyndication\\.com/",
                    "ad\\.ca\\.doubleclick\\.net",
                    "2mdn\\.net"
                ],
                "website": "google.com/adsense"
            },
            "Google Analytics": {
                "cats": [
                    10
                ],
                "env": "^gaGlobal$",
                "headers": {
                    "Set-Cookie": "__utma"
                },
                "script": "^https?://[^\\/]+\\.google-analytics\\.com\\/(?:ga|urchin|(analytics))\\.js\\;version:\\1?UA:",
                "website": "google.com/analytics"
            },
            "Google App Engine": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Google Frontend"
                },
                "website": "code.google.com/appengine"
            },
            "Google Charts": {
                "cats": [
                    25
                ],
                "env": "^__g(?:oogleVisualizationAbstractRendererElementsCount|vizguard)__$",
                "website": "developers.google.com/chart/"
            },
            "Google Code Prettify": {
                "cats": [
                    19
                ],
                "env": "^prettyPrint$",
                "website": "code.google.com/p/google-code-prettify"
            },
            "Google Font API": {
                "cats": [
                    17
                ],
                "env": "^WebFonts$",
                "html": "<link[^>]* href=[^>]+fonts\\.(?:googleapis|google)\\.com",
                "script": "googleapis\\.com/.+webfont",
                "website": "google.com/fonts"
            },
            "Google Maps": {
                "cats": [
                    35
                ],
                "script": [
                    "(?:maps\\.google\\.com/maps\\?file=api(?:&v=([\\d.]+))?|maps\\.google\\.com/maps/api/staticmap)\\;version:API v\\1",
                    "//maps.googleapis.com/maps/api/js"
                ],
                "website": "maps.google.com"
            },
            "Google PageSpeed": {
                "cats": [
                    23,
                    33
                ],
                "headers": {
                    "X-Mod-Pagespeed": "([\\d.]+)\\;version:\\1",
                    "X-Page-Speed": "(.+)\\;version:\\1"
                },
                "website": "developers.google.com/speed/pagespeed/mod"
            },
            "Google Sites": {
                "cats": [
                    1
                ],
                "url": "sites\\.google\\.com",
                "website": "sites.google.com"
            },
            "Google Tag Manager": {
                "cats": [
                    42
                ],
                "env": "^googletag$",
                "html": "googletagmanager\\.com/ns\\.html[^>]+></iframe>",
                "website": "www.google.com/tagmanager"
            },
            "Google Wallet": {
                "cats": [
                    41
                ],
                "script": [
                    "checkout\\.google\\.com",
                    "wallet\\.google\\.com"
                ],
                "website": "wallet.google.com"
            },
            "Google Web Toolkit": {
                "cats": [
                    18
                ],
                "env": "^__gwt_",
                "implies": "Java",
                "meta": {
                    "gwt:property": ""
                },
                "website": "developers.google.com/web-toolkit"
            },
            "Graffiti CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "graffitibot[^;]="
                },
                "meta": {
                    "generator": "Graffiti CMS ([^\"]+)\\;version:\\1"
                },
                "script": "/graffiti\\.js",
                "website": "graffiticms.codeplex.com"
            },
            "Grandstream": {
                "cats": [
                    22,
                    39
                ],
                "headers": {
                    "Server": "Grandstream\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "www.grandstream.com"
            },
            "Grav": {
                "cats": [
                    1
                ],
                "implies": [
                    "PHP"
                ],
                "meta": {
                    "generator": "Grav(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "website": "getgrav.org"
            },
            "Gravatar": {
                "cats": [
                    19
                ],
                "env": "^Gravatar$",
                "html": "<[^]+gravatar\\.com/avatar/",
                "website": "gravatar.com"
            },
            "Gravity Insights": {
                "cats": [
                    10
                ],
                "env": "^GravityInsights$",
                "website": "insights.gravity.com"
            },
            "Green Valley CMS": {
                "cats": [
                    1
                ],
                "html": "<img[^>]+/dsresource\\?objectid=",
                "meta": {
                    "DC.identifier": "/content\\.jsp\\?objectid="
                },
                "website": "www.greenvalley.nl/Public/Producten/Content_Management/CMS"
            },
            "HERE": {
                "cats": [
                    35
                ],
                "script": "https?://js\\.cit\\.api\\.here\\.com/se/([\\d.]+)\\/\\;version:\\1",
                "website": "developer.here.com"
            },
            "HP": {
                "cats": [
                    40
                ],
                "website": "hp.com"
            },
            "HP ChaiServer": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "HP-Chai(?:Server|SOE)(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "HP"
                ],
                "website": "hp.com"
            },
            "HP Compact Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "HP_Compact_Server(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "hp.com"
            },
            "HP ProCurve": {
                "cats": [
                    37
                ],
                "website": "hp.com/networking"
            },
            "HP System Management": {
                "cats": [
                    46
                ],
                "headers": {
                    "Server": "HP System Management"
                },
                "website": "hp.com"
            },
            "HP iLO": {
                "cats": [
                    22,
                    46
                ],
                "headers": {
                    "Server": "HP-iLO-Server(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "hp.com"
            },
            "HTTP-Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "(?:^|[^-])\bHTTP-Server(?: ?/?V?([\\d.]+))?\\;version:\\1"
                },
                "website": "???"
            },
            "Hammer.js": {
                "cats": [
                    12
                ],
                "env": "^Hammer$",
                "script": "hammer(\\.min)?\\.js",
                "website": "hammerjs.github.io"
            },
            "Handlebars": {
                "cats": [
                    12
                ],
                "env": "^Handlebars$",
                "html": "<[^>]*type=[^>]text\\/x-handlebars-template",
                "script": "handlebars(?:\\.runtime)?(?:-v([\\d.]+?))?(?:\\.min)?\\.js\\;version:\\1",
                "website": "handlebarsjs.com"
            },
            "Happy ICS Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Happy ICS Server(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "OmniTouch 8660 My Teamwork",
                "website": "???"
            },
            "Haskell": {
                "cats": [
                    27
                ],
                "website": "wiki.haskell.org/Haskell"
            },
            "HeadJS": {
                "cats": [
                    12
                ],
                "env": "^head$\\;confidence:50",
                "html": "<[^>]*data-headjs-load",
                "script": "head\\.(?:core|load)(?:\\.min)?\\.js",
                "website": "headjs.com"
            },
            "Hello Bar": {
                "cats": [
                    5
                ],
                "env": "^HelloBar$",
                "script": "hellobar\\.js",
                "website": "hellobar.com"
            },
            "HHVM": {
                "cats": [
                    22
                ],
                "headers": {
                    "X-Powered-By": "HHVM/?([\\d.]+)?\\;version:\\1"
                },
                "website": "hhvm.com",
                "implies": "PHP\\;confidence:50"
            },
            "Hiawatha": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Hiawatha v([\\d.]+)\\;version:\\1"
                },
                "website": "hiawatha-webserver.org"
            },
            "Highcharts": {
                "cats": [
                    25
                ],
                "env": "^Highcharts$",
                "html": "<svg[^>]*><desc>Created with Highcharts ([\\d.]*)\\;version:\\1",
                "script": "highcharts.*\\.js",
                "website": "highcharts.com"
            },
            "Highstock": {
                "cats": [
                    25
                ],
                "html": "<svg[^>]*><desc>Created with Highstock ([\\d.]*)\\;version:\\1",
                "script": "highstock(?:\\-|\\.)?([\\d\\.]*\\d).*\\.js\\;version:\\1",
                "website": "highcharts.com/products/highstock"
            },
            "Hippo": {
                "cats": [
                    1
                ],
                "html": " <[^>]+/binaries/(?:[^/]+/)*content/gallery/",
                "website": "onehippo.org"
            },
            "Hogan.js": {
                "cats": [
                    12
                ],
                "env": "^Hogan$",
                "script": [
                    "hogan-(?:-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "([\\d.]+)/hogan(\\.min)?\\.js\\;version:\\1"
                ],
                "website": "twitter.github.com/hogan.js"
            },
            "Hotaru CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "hotaru_mobile="
                },
                "meta": {
                    "generator": "Hotaru CMS"
                },
                "website": "hotarucms.org"
            },
            "HubSpot": {
                "cats": [
                    32
                ],
                "env": "^(?:_hsq|hubspot)$",
                "html": "<!-- Start of Async HubSpot",
                "website": "hubspot.com"
            },
            "Hybris": {
                "cats": [
                    6
                ],
                "headers": {
                    "Set-Cookie": "_hybris"
                },
                "html": "<[^]+(?:/sys_master/|/hybr/|/_ui/desktop/)",
                "implies": "Java",
                "website": "hybris.com"
            },
            "IBM Coremetrics": {
                "cats": [
                    10
                ],
                "script": "cmdatatagutils\\.js",
                "website": "ibm.com/software/marketing-solutions/coremetrics"
            },
            "IBM HTTP Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "IBM_HTTP_Server(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "ibm.com/software/webservers/httpservers"
            },
            "IBM Tivoli Storage Manager": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "TSM_HTTP(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "ibm.com"
            },
            "IBM WebSphere Commerce": {
                "cats": [
                    6
                ],
                "implies": "Java",
                "url": "/wcs/",
                "website": "ibm.com/software/genservers/commerceproductline"
            },
            "IBM WebSphere Portal": {
                "cats": [
                    1
                ],
                "headers": {
                    "IBM-Web2-Location": "",
                    "Itx-Generated-Timestamp": ""
                },
                "implies": "Java",
                "url": "/wps/",
                "website": "ibm.com/software/websphere/portal"
            },
            "IIS": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "IIS(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "Windows Server",
                "website": "www.iis.net"
            },
            "INFOnline": {
                "cats": [
                    10
                ],
                "env": [
                    "^szmvars$",
                    "^iam_data$"
                ],
                "script": "^https?://(?:[^/]+\\.)?i(?:oam|v)wbox\\.de/",
                "website": "infonline.de"
            },
            "IPB": {
                "cats": [
                    2
                ],
                "env": "^(?:IPBoard$|ipb_var)",
                "html": "<link[^>]+ipb_[^>]+\\.css",
                "script": "jscripts/ips_",
                "website": "www.invisionpower.com"
            },
            "ImpressCMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "ICMSession[^;]+=",
                    "X-Powered-By": "ImpressCMS"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "ImpressCMS"
                },
                "script": "include/linkexternal\\.js",
                "website": "www.impresscms.org"
            },
            "ImpressPages": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "ImpressPages(?: CMS)?( [\\d.]*)\\;version:\\1"
                },
                "website": "impresspages.org"
            },
            "InProces": {
                "cats": [
                    1
                ],
                "html": "<!-- CSS InProces Portaal default -->",
                "script": "brein/inproces/website/websitefuncties\\.js",
                "website": "www.brein.nl/oplossing/product/website"
            },
            "Incapsula": {
                "cats": [
                    31
                ],
                "headers": {
                    "X-CDN": "Incapsula"
                },
                "website": "www.incapsula.com"
            },
            "Indexhibit": {
                "cats": [
                    1
                ],
                "html": "<(?:link|a href) [^>]+ndxz-studio",
                "implies": [
                    "PHP",
                    "Apache",
                    "Exhibit"
                ],
                "meta": {
                    "generator": "Indexhibit"
                },
                "website": "www.indexhibit.org"
            },
            "Indico": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-cookie": "MAKACSESSION"
                },
                "html": "Powered by\\s+(?:CERN )?<a href=\"http://(?:cdsware\\.cern\\.ch/indico/|indico-software\\.org|cern\\.ch/indico)\">(?:CDS )?Indico( [\\d\\.]+)?\\;version:\\1",
                "website": "indico-software.org"
            },
            "Indy": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Indy(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "indyproject.org"
            },
            "InstantCMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "InstantCMS\\[logdate\\]="
                },
                "meta": {
                    "generator": "InstantCMS"
                },
                "website": "www.instantcms.ru"
            },
            "Intel Active Management Technology": {
                "cats": [
                    22,
                    46
                ],
                "headers": {
                    "Server": "Intel\\(R\\) Active Management Technology(?: ([\\d.]+))?\\;version:\\1"
                },
                "website": "intel.com"
            },
            "IntenseDebate": {
                "cats": [
                    15
                ],
                "script": "intensedebate\\.com",
                "website": "intensedebate.com"
            },
            "Intercom": {
                "cats": [
                    10
                ],
                "env": "^Intercom$",
                "script": "(?:api\\.intercom\\.io/api|static\\.intercomcdn\\.com/intercom\\.v1)",
                "website": "intercom.io"
            },
            "Intershop": {
                "cats": [
                    6
                ],
                "script": "(?:is-bin|INTERSHOP)",
                "website": "intershop.com"
            },
            "Invenio": {
                "cats": [
                    50
                ],
                "headers": {
                    "Set-cookie": "INVENIOSESSION"
                },
                "html": "(?:Powered by|System)\\s+(?:CERN )?<a (?:class=\"footer\" )?href=\"http://(?:cdsware\\.cern\\.ch(?:/invenio)?|invenio-software\\.org|cern\\.ch/invenio)(?:/)?\">(?:CDS )?Invenio</a>\\s*v?([\\d\\.]+)?\\;version:\\1",
                "website": "invenio-software.org"
            },
            "Ionicons": {
                "cats": [
                    17
                ],
                "html": "<link[^>]* href=[^>]+ionicons(?:\\.min)?\\.css",
                "website": "ionicons.com"
            },
            "JAlbum": {
                "cats": [
                    7
                ],
                "implies": "Java",
                "meta": {
                    "generator": "JAlbum( [\\d.]+)?\\;version:\\1"
                },
                "website": "jalbum.net/en"
            },
            "JBoss Application Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "X-Powered-By": "JBoss(?:-([\\d.]+))?\\;version:\\1"
                },
                "website": "jboss.org/jbossas.html"
            },
            "JBoss Web": {
                "cats": [
                    22
                ],
                "excludes": "Apache Tomcat",
                "headers": {
                    "X-Powered-By": "JBossWeb(?:-([\\d.]+))?\\;version:\\1"
                },
                "implies": "JBoss Application Server",
                "website": "jboss.org/jbossweb"
            },
            "JC-HTTPD": {
                "cats": [
                    22
                ],
                "excludes": "Apache",
                "headers": {
                    "Server": "JC-HTTPD(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Canon"
                ],
                "website": "canon.com"
            },
            "JS Charts": {
                "cats": [
                    25
                ],
                "env": "^JSChart$",
                "script": "jscharts.*\\.js",
                "website": "www.jscharts.com"
            },
            "JTL Shop": {
                "cats": [
                    6
                ],
                "headers": {
                    "Set-Cookie": "JTLSHOP="
                },
                "html": "(?:<input[^>]+name=\"JTLSHOP|<a href=\"jtl\\.php)",
                "website": "www.jtl-software.de/produkte/jtl-shop3"
            },
            "Jalios": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "Jalios"
                },
                "website": "www.jalios.com"
            },
            "Java": {
                "cats": [
                    27
                ],
                "headers": {
                    "Set-Cookie": "JSESSIONID"
                },
                "website": "java.com"
            },
            "Java Servlet": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "Servlet(?:.([\\d.]+))?\\;version:\\1"
                },
                "implies": "Java",
                "website": "www.oracle.com/technetwork/java/index-jsp-135475.html"
            },
            "JavaServer Faces": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "JSF(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "Java",
                "website": "javaserverfaces.java.net"
            },
            "JavaServer Pages": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "JSP(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "Java",
                "website": "www.oracle.com/technetwork/java/javaee/jsp/index.html"
            },
            "Javascript Infovis Toolkit": {
                "cats": [
                    25
                ],
                "env": "^\\$jit$",
                "script": "jit.*\\.js",
                "website": "thejit.org"
            },
            "Jekyll": {
                "cats": [
                    1,
                    11
                ],
                "meta": {
                    "generator": "Jekyll (v[\\d.]+)?\\;version:\\1"
                },
                "website": "jekyllrb.com"
            },
            "Jenkins": {
                "cats": [
                    44
                ],
                "headers": {
                    "X-Jenkins": "([\\d\\.]+)\\;version:\\1"
                },
                "website": "jenkins-ci.org"
            },
            "Jetty": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Jetty(?:\\(([\\d\\.]*\\d+))?\\;version:\\1"
                },
                "implies": "Java",
                "website": "www.eclipse.org/jetty"
            },
            "Jirafe": {
                "cats": [
                    10,
                    32
                ],
                "env": "^jirafe$",
                "script": "/jirafe\\.js",
                "website": "jirafe.com"
            },
            "Jo": {
                "cats": [
                    26,
                    12
                ],
                "env": "^jo(?:Cache|DOM|Event)$",
                "website": "joapp.com"
            },
            "JobberBase": {
                "cats": [
                    19
                ],
                "env": "^Jobber$",
                "meta": {
                    "generator": "Jobberbase"
                },
                "website": "jobberbase.com"
            },
            "Joomla": {
                "cats": [
                    1
                ],
                "env": "^(?:jcomments|Joomla)$",
                "headers": {
                    "X-Content-Encoded-By": "Joomla! ([\\d.]+)\\;version:\\1"
                },
                "html": "(?:<div[^>]+id=\"wrapper_r\"|<[^>]+(?:feed|components)/com_|<table[^>]+class=\"pill)\\;confidence:50",
                "implies": "PHP",
                "meta": {
                    "generator": "Joomla!(?: ([\\d.]+))?\\;version:\\1"
                },
                "url": "option=com_",
                "website": "joomla.org"
            },
            "K2": {
                "cats": [
                    19
                ],
                "env": "^K2RatingURL$",
                "html": "<!--(?: JoomlaWorks \"K2\"| Start K2)",
                "implies": "Joomla",
                "website": "getk2.org"
            },
            "KISSmetrics": {
                "cats": [
                    10
                ],
                "env": "^KM_COOKIE_DOMAIN$",
                "website": "www.kissmetrics.com"
            },
            "KS_HTTP": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "KS_HTTP\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "implies": "Canon",
                "website": "www.canon.com"
            },
            "Kampyle": {
                "cats": [
                    10,
                    13
                ],
                "env": "^k_track$",
                "headers": {
                    "Set-Cookie": "k_visit"
                },
                "script": "cf\\.kampyle\\.com/k_button\\.js",
                "website": "www.kampyle.com"
            },
            "Kendo UI": {
                "cats": [
                    18
                ],
                "env": "^kendo$",
                "html": "<link[^>]*\\s+href=[^>]*styles/kendo\\.common(?:\\.min)?\\.css[^>]*/>",
                "implies": "jQuery",
                "website": "www.kendoui.com"
            },
            "Kentico CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "CMSPreferredCulture="
                },
                "meta": {
                    "generator": "Kentico CMS ([\\d.R]+ \\(build [\\d.]+\\))\\;version:\\1"
                },
                "website": "www.kentico.com"
            },
            "KineticJS": {
                "cats": [
                    25
                ],
                "env": "^Kinetic$",
                "script": "kinetic(?:-v?([\\d.]+))?(?:\\.min)?\\.js\\;version:\\1",
                "website": "kineticjs.com"
            },
            "Knockout.js": {
                "cats": [
                    12
                ],
                "env": "^ko$",
                "website": "knockoutjs.com"
            },
            "Koa": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "^koa$"
                },
                "implies": "node.js",
                "website": "koajs.com"
            },
            "Koala Framework": {
                "cats": [
                    1,
                    18
                ],
                "html": "<!--[^>]+This website is powered by Koala Web Framework CMS",
                "implies": "PHP",
                "meta": {
                    "generator": "^Koala Web Framework CMS"
                },
                "website": "koala-framework.org"
            },
            "Koego": {
                "cats": [
                    10
                ],
                "env": "^ego_domains$",
                "script": "tracking\\.koego\\.com/end/ego\\.js",
                "website": "www.koego.com/en"
            },
            "Kohana": {
                "cats": [
                    18
                ],
                "headers": {
                    "Set-Cookie": "kohanasession",
                    "X-Powered-By": "Kohana Framework ([\\d.]+)\\;version:\\1"
                },
                "implies": "PHP",
                "website": "kohanaframework.org"
            },
            "Koken": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "koken_referrer="
                },
                "html": [
                    "<html lang=\"en\" class=\"k-source-essays k-lens-essays\">",
                    "<!--\\s+KOKEN DEBUGGING"
                ],
                "implies": [
                    "PHP",
                    "MySQL"
                ],
                "meta": {
                    "generator": "Koken ([\\d.]+);version:\\1"
                },
                "script": "koken(?:\\.js\\?([\\d.]+)|/storage);version:\\1",
                "website": "koken.me"
            },
            "Kolibri CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "Kolibri"
                },
                "meta": {
                    "generator": "Kolibri"
                },
                "website": "alias.io"
            },
            "Komodo CMS": {
                "cats": [
                    1
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "^Komodo CMS"
                },
                "website": "www.komodocms.com"
            },
            "Koobi": {
                "cats": [
                    1
                ],
                "html": "<!--[^K>-]+Koobi ([a-z\\d.]+)\\;version:\\1",
                "meta": {
                    "generator": "Koobi"
                },
                "website": "dream4.de/cms"
            },
            "Kooboo CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-KoobooCMS-Version": "(.*)\\;version:\\1"
                },
                "implies": "Microsoft ASP.NET",
                "script": "/Kooboo",
                "website": "kooboo.com"
            },
            "LEPTON": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "lep\\d+sessionid="
                },
                "implies": "PHP",
                "meta": {
                    "generator": "LEPTON"
                },
                "website": "www.lepton-cms.org"
            },
            "LabVIEW": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "LabVIEW(?:/([\\d\\.]+))?\\;version:\\1"
                },
                "website": "ni.com/labview"
            },
            "Laravel": {
                "cats": [
                    18
                ],
                "headers": {
                    "Set-Cookie": "laravel_session"
                },
                "implies": "PHP",
                "website": "laravel.com"
            },
            "Lazy.js": {
                "cats": [
                    12
                ],
                "script": "lazy(\\.browser)?(\\.min)?\\.js",
                "website": "danieltao.com/lazy.js"
            },
            "Leaflet": {
                "cats": [
                    35
                ],
                "script": "leaflet.*\\.js",
                "website": "leafletjs.com"
            },
            "Less": {
                "cats": [
                    19
                ],
                "html": "<link[^>]+ rel=\"stylesheet/less\"",
                "website": "lesscss.org"
            },
            "Liferay": {
                "cats": [
                    1
                ],
                "env": "^Liferay$",
                "headers": {
                    "Liferay-Portal": "[a-z\\s]+([\\d.]+)\\;version:\\1"
                },
                "website": "www.liferay.com"
            },
            "Lift": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Lift-Version": "(.+)\\;version:\\1"
                },
                "implies": "Scala",
                "website": "liftweb.net"
            },
            "LightMon Engine": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "lm_online"
                },
                "html": "<!-- Lightmon Engine Copyright Lightmon",
                "implies": [
                    "PHP"
                ],
                "meta": {
                    "generator": "LightMon Engine"
                },
                "website": "lightmon.ru"
            },
            "Lightbox": {
                "cats": [
                    7,
                    12
                ],
                "html": "<link [^>]*href=\"[^\"]+lightbox(?:\\.min)?\\.css",
                "script": "lightbox.*\\.js",
                "website": "lokeshdhakar.com/projects/lightbox2/"
            },
            "LimeSurvey": {
                "cats": [
                    19
                ],
                "headers": {
                    "generator": "LimeSurvey"
                },
                "website": "limesurvey.org/"
            },
            "LinkSmart": {
                "cats": [
                    36
                ],
                "env": "^(?:_mb_site_guid$|LS_JSON|LinkSmart(?:_|$))",
                "script": "^https?://cdn\\.linksmart\\.com/linksmart_([\\d.]+?)(?:\\.min)?\\.js\\;version:\\1",
                "website": "linksmart.com"
            },
            "LiteSpeed": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "^LiteSpeed$"
                },
                "website": "litespeedtech.com"
            },
            "Lithium": {
                "cats": [
                    1
                ],
                "env": [
                    "^LITHIUM$"
                ],
                "headers": {
                    "Set-Cookie": "LithiumVisitor="
                },
                "html": " <a [^>]+Powered by Lithium",
                "implies": "PHP",
                "website": "www.lithium.com"
            },
            "LiveJournal": {
                "cats": [
                    11
                ],
                "url": "\\.livejournal\\.com",
                "website": "www.livejournal.com"
            },
            "LiveStreet CMS": {
                "cats": [
                    1
                ],
                "env": "^LIVESTREET",
                "headers": {
                    "X-Powered-By": "LiveStreet CMS"
                },
                "website": "livestreetcms.com"
            },
            "Livefyre": {
                "cats": [
                    15
                ],
                "env": [
                    "^fyre$",
                    "^FyreLoader$",
                    "^LF$"
                ],
                "html": "<[^>]+(?:id|class)=\"livefyre",
                "script": "livefyre_init\\.js",
                "website": "livefyre.com"
            },
            "Lo-dash": {
                "cats": [
                    12
                ],
                "script": "lodash.*\\.js",
                "website": "www.lodash.com"
            },
            "Lockerz Share": {
                "cats": [
                    5
                ],
                "env": "^a2apage_init$",
                "script": "addtoany\\.com/menu/page\\.js",
                "website": "share.lockerz.com"
            },
            "Locomotive": {
                "cats": [
                    1
                ],
                "html": "<link[^>]*/sites/[a-z\\d]{24}/theme/stylesheets",
                "implies": [
                    "Ruby on Rails",
                    "MongoDB"
                ],
                "website": "www.locomotivecms.com"
            },
            "Logitech Media Server": {
                "cats": [
                    22,
                    38
                ],
                "headers": {
                    "Server": "Logitech Media Server(?: \\(([\\d\\.]+))?\\;version:\\1"
                },
                "website": "www.mysqueezebox.com"
            },
            "Lotus Domino": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Lotus-Domino"
                },
                "website": "www-01.ibm.com/software/lotus/products/domino"
            },
            "Lua": {
                "cats": [
                    27
                ],
                "headers": {
                    "X-Powered-By": "\bLua(?: ([\\d.]+))?\\;version:\\1"
                },
                "website": "www.lua.org"
            },
            "Lucene": {
                "cats": [
                    34
                ],
                "website": "lucene.apache.org/core/"
            },
            "M.R. Inc Webserver": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "M\\.R\\. Inc Webserver"
                },
                "website": "mrincworld.com"
            },
            "M.R. Inc Wild CMS": {
                "cats": [
                    1,
                    6
                ],
                "headers": {
                    "X-Powered-By": "M\\.R\\. Inc Wild CMS"
                },
                "website": "mrincworld.com"
            },
            "MOBOTIX": {
                "cats": [
                    39
                ],
                "meta": {
                    "author": "MOBOTIX AG\\;confidence:40",
                    "copyright": "MOBOTIX AG\\;confidence:40",
                    "publisher": "MOBOTIX AG\\;confidence:40"
                },
                "url": "control/userimage\\.html\\;confidence:70",
                "website": "mobotix.com"
            },
            "MODx": {
                "cats": [
                    1
                ],
                "env": "^MODX_MEDIA_PATH$",
                "headers": {
                    "Set-Cookie": "SN4[a-f\\d]{12}",
                    "X-Powered-By": "^MODx"
                },
                "html": [
                    "<a[^>]+>Powered by MODx</a>",
                    "<(?:link|script)[^>]+assets/snippets/\\;confidence:20"
                ],
                "implies": "PHP",
                "website": "modxcms.com"
            },
            "Magento": {
                "cats": [
                    6
                ],
                "env": "^(?:Mage|VarienForm)$",
                "headers": {
                    "Set-Cookie": "frontend=\\;confidence:50"
                },
                "implies": "PHP",
                "script": [
                    "js/mage",
                    "skin/frontend/(?:default|(enterprise))\\;version:\\1?Enterprise:Community"
                ],
                "website": "www.magentocommerce.com"
            },
            "Mambo": {
                "cats": [
                    1
                ],
                "excludes": "Joomla",
                "meta": {
                    "generator": "Mambo"
                },
                "website": "mambo-foundation.org"
            },
            "MantisBT": {
                "cats": [
                    13
                ],
                "html": "<img[^>]+ alt=\"Powered by Mantis Bugtracker",
                "website": "www.mantisbt.org"
            },
            "ManyContacts": {
                "cats": [
                    5
                ],
                "script": "\\/assets\\/js\\/manycontacts\\.min\\.js",
                "website": "www.manycontacts.com"
            },
            "Marketo": {
                "cats": [
                    32
                ],
                "env": "^Munchkin$",
                "script": "munchkin\\.marketo\\.net/munchkin\\.js",
                "website": "www.marketo.com"
            },
            "MathJax": {
                "cats": [
                    25
                ],
                "env": "^MathJax$",
                "script": "mathjax\\.js",
                "website": "mathjax.org"
            },
            "MaxSite CMS": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "MaxSite CMS"
                },
                "website": "max-3000.com"
            },
            "Mean.io": {
                "cats": [
                    12
                ],
                "headers": {
                    "X-Powered-CMS": "Mean\\.io"
                },
                "implies": [
                    "MongoDB",
                    "Express",
                    "AngularJS",
                    "node.js"
                ],
                "website": "mean.io"
            },
            "MediaElement.js": {
                "cats": [
                    14
                ],
                "env": "^mejs$",
                "website": "mediaelementjs.com"
            },
            "MediaTomb": {
                "cats": [
                    38
                ],
                "headers": {
                    "Server": "MediaTomb(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "mediatomb.cc"
            },
            "MediaWiki": {
                "cats": [
                    8
                ],
                "html": "(?:<a[^>]+>Powered by MediaWiki</a>|<[^>]+id=\"t-specialpages)",
                "meta": {
                    "generator": "MediaWiki"
                },
                "website": "www.mediawiki.org"
            },
            "Meebo": {
                "cats": [
                    5
                ],
                "html": "(?:<iframe id=\"meebo-iframe\"|Meebo\\('domReady'\\))",
                "website": "www.meebo.com"
            },
            "Meteor": {
                "cats": [
                    12
                ],
                "env": "^Meteor$",
                "html": "<link[^>]+__meteor-css__",
                "website": "meteor.com"
            },
            "Methode": {
                "cats": [
                    1
                ],
                "env": "^eidosBase$\\;confidence:99",
                "html": "<!-- Methode uuid: \"[a-f\\d]+\" ?-->",
                "meta": {
                    "eomportal-id": "\\d+",
                    "eomportal-instanceid": "\\d+",
                    "eomportal-lastUpdate": "",
                    "eomportal-loid": "[\\d.]+",
                    "eomportal-uuid": "[a-f\\d]+"
                },
                "website": "www.eidosmedia.com/solutions"
            },
            "Microsoft ASP.NET": {
                "cats": [
                    18
                ],
                "headers": {
                    "Set-Cookie": "ASPSESSION|ASP\\.NET_SessionId",
                    "X-AspNet-Version": "(.+)\\;version:\\1",
                    "X-Powered-By": "ASP\\.NET\\;confidence:50"
                },
                "html": "<input[^>]+name=\"__VIEWSTATE",
                "implies": "IIS\\;confidence:50",
                "url": "\\.aspx(?:$|\\?)",
                "website": "www.asp.net"
            },
            "Microsoft HTTPAPI": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Microsoft-HTTPAPI(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "microsoft.com"
            },
            "Microsoft SharePoint": {
                "cats": [
                    1
                ],
                "env": "^_spBodyOnLoadCalled$",
                "headers": {
                    "MicrosoftSharePointTeamServices": "(.*)\\;version:\\1",
                    "SPRequestGuid": "",
                    "SharePointHealthScore": "",
                    "X-SharePointHealthScore": ""
                },
                "meta": {
                    "generator": "Microsoft SharePoint"
                },
                "website": "sharepoint.microsoft.com"
            },
            "MiniBB": {
                "cats": [
                    2
                ],
                "html": "<a href=\"[^\"]+minibb[^<]+</a>[^<]+\n<!--End of copyright link",
                "website": "www.minibb.com"
            },
            "MiniServ": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "MiniServ\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "sourceforge.net/projects/miniserv"
            },
            "Mint": {
                "cats": [
                    10
                ],
                "env": "^Mint$",
                "script": "mint/\\?js",
                "website": "haveamint.com"
            },
            "Mixpanel": {
                "cats": [
                    10
                ],
                "env": "^Mixpanel$",
                "script": "api\\.mixpanel\\.com/track",
                "website": "mixpanel.com"
            },
            "Mobify": {
                "cats": [
                    26
                ],
                "env": "^Mobify$",
                "script": "mobify\\.com",
                "website": "www.mobify.com"
            },
            "MochiKit": {
                "cats": [
                    12
                ],
                "env": "^MochiKit$",
                "script": "MochiKit(?:\\.min)?\\.js",
                "website": "mochikit.com"
            },
            "MochiWeb": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "MochiWeb(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "github.com/mochi/mochiweb"
            },
            "Modernizr": {
                "cats": [
                    12
                ],
                "env": "^Modernizr$",
                "script": "modernizr(?:-([\\d.]*[\\d]))?.*\\.js\\;version:\\1",
                "website": "www.modernizr.com"
            },
            "Moguta.CMS": {
                "cats": [
                    1,
                    6
                ],
                "html": "(<script|link)[^>]*mg-(core|plugins|templates)",
                "implies": "PHP",
                "website": "moguta.ru"
            },
            "MoinMoin": {
                "cats": [
                    8
                ],
                "env": "^show_switch2gui$",
                "implies": "Python",
                "script": "moin(?:_static(\\d)(\\d)(\\d)|.+)/common/js/common\\.js\\;version:\\1.\\2.\\3",
                "website": "moinmo.in"
            },
            "Mojolicious": {
                "cats": [
                    18
                ],
                "headers": {
                    "x-powered-by": "mojolicious"
                },
                "implies": "Perl",
                "website": "mojolicio.us"
            },
            "Mollom": {
                "cats": [
                    16
                ],
                "html": "<img[^>]+\\.mollom\\.com",
                "script": "mollom(?:\\.min)?\\.js",
                "website": "mollom.com"
            },
            "Moment Timezone": {
                "cats": [
                    12
                ],
                "implies": "Moment.js",
                "script": "moment-timezone(?:\\-data)?(?:\\.min)?\\.js",
                "website": "momentjs.com/timezone/"
            },
            "Moment.js": {
                "cats": [
                    12
                ],
                "env": "^moment$",
                "script": "moment(?:\\.min)?\\.js",
                "website": "momentjs.com"
            },
            "Mondo Media": {
                "cats": [
                    6
                ],
                "meta": {
                    "generator": "Mondo Shop"
                },
                "website": "mondo-media.de"
            },
            "MongoDB": {
                "cats": [
                    34
                ],
                "website": "www.mongodb.org"
            },
            "Mongrel": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Mongrel"
                },
                "implies": "Ruby",
                "website": "mongrel2.org"
            },
            "Monkey HTTP Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Monkey/?([\\d.]+)?\\;version:\\1"
                },
                "website": "monkey-project.com"
            },
            "Mono": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "Mono"
                },
                "website": "mono-project.com"
            },
            "Mono.net": {
                "cats": [
                    1
                ],
                "env": "^_monoTracker$",
                "implies": "Piwik",
                "script": "monotracker(?:\\.min)?\\.js",
                "website": "www.mono.net"
            },
            "MooTools": {
                "cats": [
                    12
                ],
                "env": "^MooTools$",
                "script": "mootools.*\\.js",
                "website": "mootools.net"
            },
            "Moodle": {
                "cats": [
                    21
                ],
                "env": "^moodle",
                "headers": {
                    "Set-Cookie": "MoodleSession"
                },
                "html": "<img[^>]+moodlelogo",
                "implies": "PHP",
                "website": "moodle.org"
            },
            "Kotisivukone": {
                "cats": [
                    1
                ],
                "script": "kotisivukone(?:\\.min)?\\.js",
                "website": "www.kotisivukone.fi"
            },
            "Motion-httpd": {
                "cats": [
                    22
                ],
                "excludes": "Apache",
                "headers": {
                    "Server": "Motion-httpd(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "lavrsen.dk/foswiki/bin/view/Motion"
            },
            "Movable Type": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "Movable Type"
                },
                "website": "movabletype.org"
            },
            "Moxa": {
                "cats": [
                    37
                ],
                "headers": {
                    "Server": "MoxaHttp(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "moxa.com"
            },
            "Mozard Suite": {
                "cats": [
                    1
                ],
                "meta": {
                    "author": "Mozard"
                },
                "url": "/mozard/!suite",
                "website": "mozard.nl"
            },
            "Mura CMS": {
                "cats": [
                    1,
                    11
                ],
                "implies": "Adobe ColdFusion",
                "meta": {
                    "generator": "Mura CMS ([\\d]+)\\;version:\\1"
                },
                "website": "www.getmura.com"
            },
            "Mustache": {
                "cats": [
                    12
                ],
                "env": "^Mustache$",
                "script": "mustache(?:\\.min)?\\.js",
                "website": "mustache.github.com"
            },
            "MyBB": {
                "cats": [
                    2
                ],
                "env": "^MyBB$",
                "html": "(?:<script [^>]+\\s+<!--\\s+lang\\.no_new_posts|<a[^>]* title=\"Powered By MyBB)",
                "implies": [
                    "PHP",
                    "MySQL"
                ],
                "website": "www.mybboard.net"
            },
            "MyBlogLog": {
                "cats": [
                    5
                ],
                "script": "pub\\.mybloglog\\.com",
                "website": "www.mybloglog.com"
            },
            "MySQL": {
                "cats": [
                    34
                ],
                "website": "mysql.com"
            },
            "Mynetcap": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "Mynetcap"
                },
                "website": "www.netcap-creation.fr"
            },
            "NOIX": {
                "cats": [
                    19
                ],
                "html": "(?:<[^>]+(?:src|href)=[^>]*/media/noix|<!-- NOIX)",
                "website": "www.noix.com.br/tecnologias/joomla"
            },
            "NVD3": {
                "cats": [
                    25
                ],
                "env": "^nv$",
                "html": "<link[^>]* href=[^>]+nv\\.d3(?:\\.min)?\\.css",
                "implies": "D3",
                "script": "nv\\.d3(?:\\.min)?\\.js",
                "website": "nvd3.org"
            },
            "Nedstat": {
                "cats": [
                    10
                ],
                "env": "^sitestat$",
                "website": "www.nedstat.com"
            },
            "Nepso": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-CMS": "Nepso"
                },
                "implies": [
                    "Python",
                    "Perl",
                    "Java",
                    "PHP"
                ],
                "website": "nepso.com"
            },
            "Netmonitor": {
                "cats": [
                    10
                ],
                "env": "^netmonitor$",
                "script": "netmonitor\\.fi/nmtracker\\.js",
                "website": "netmonitor.fi/en"
            },
            "Netsuite": {
                "cats": [
                    6
                ],
                "headers": {
                    "Set-Cookie": "NS_VER="
                },
                "website": "netsuite.com"
            },
            "Nette Framework": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "Nette Framework"
                },
                "implies": "PHP",
                "website": "nette.org"
            },
            "New Relic": {
                "cats": [
                    10
                ],
                "env": "^NREUM",
                "website": "newrelic.com"
            },
            "Nginx": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "nginx(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "nginx.org"
            },
            "Odoo": {
                "cats": [
                    1,
                    6
                ],
                "implies": [
                    "Python",
                    "PostgreSQL",
                    "node.js",
                    "Less"
                ],
                "meta": {
                    "generator": "Odoo"
                },
                "script": "/web/js/(?:web\\.assets_common/|website\\.assets_frontend/)\\;confidence:25",
                "html": "<link[^>]* href=[^>]+/web/css/(?:web\\.assets_common/|website\\.assets_frontend/)\\;confidence:25",
                "website": "odoo.com"
            },
            "OWL Carousel": {
                "cats": [
                    5,
                    7
                ],
                "html": "<link [^>]*href=\"[^\"]+owl.carousel(?:\\.min)?\\.css",
                "implies": "jQuery",
                "script": "owl.carousel.*\\.js",
                "website": "owlgraphic.com/owlcarousel"
            },
            "OXID eShop": {
                "cats": [
                    6
                ],
                "env": "^ox(?:TopMenu|ModalPopup|LoginBox|InputValidator)",
                "html": "<!--[^-]*OXID eShop",
                "website": "oxid-esales.com"
            },
            "October CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "october_session="
                },
                "implies": "Laravel",
                "website": "octobercms.com"
            },
            "OmniTouch 8660 My Teamwork": {
                "cats": [
                    19
                ],
                "website": "enterprise.alcatel-lucent.com"
            },
            "OneStat": {
                "cats": [
                    10
                ],
                "env": "^OneStat",
                "website": "www.onestat.com"
            },
            "Open AdStream": {
                "cats": [
                    36
                ],
                "env": "^OAS_AD$",
                "website": "xaxis.com"
            },
            "Open Classifieds": {
                "cats": [
                    6
                ],
                "meta": {
                    "author": "open-classifieds\\.com",
                    "copyright": "Open Classifieds ?([0-9.]+)?\\;version:\\1"
                },
                "website": "open-classifieds.com"
            },
            "Open Journal Systems": {
                "cats": [
                    50
                ],
                "headers": {
                    "Set-Cookie": "\bOJSSID\b"
                },
                "implies": [
                    "PHP"
                ],
                "meta": {
                    "generator": "Open Journal Systems(?: ([\\d.]+))?\\;version:\\1"
                },
                "website": "pkp.sfu.ca/ojs"
            },
            "Open Web Analytics": {
                "cats": [
                    10
                ],
                "env": "^_?owa_",
                "html": "<!-- (?:Start|End) Open Web Analytics Tracker -->",
                "website": "openwebanalytics.com"
            },
            "Open eShop": {
                "cats": [
                    6
                ],
                "meta": {
                    "author": "open-eshop\\.com",
                    "copyright": "Open eShop ?([0-9.]+)?\\;version:\\1"
                },
                "website": "open-eshop.com/"
            },
            "OpenCart": {
                "cats": [
                    6
                ],
                "html": "(?:index\\.php\\?route=[a-z]+/|Powered By <a href=\"[^>]+OpenCart)",
                "implies": "PHP",
                "website": "www.opencart.com"
            },
            "OpenCms": {
                "cats": [
                    1
                ],
                "headers": {
                    "Server": "OpenCms"
                },
                "html": "<link href=\"/opencms/",
                "implies": "Java",
                "script": "opencms",
                "website": "www.opencms.org"
            },
            "OpenGSE": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "GSE"
                },
                "implies": "Java",
                "website": "code.google.com/p/opengse"
            },
            "OpenGrok": {
                "cats": [
                    19
                ],
                "headers": {
                    "Set-Cookie": "OpenGrok"
                },
                "implies": "Java",
                "meta": {
                    "generator": "OpenGrok(?: v?([\\d.]+))?\\;version:\\1"
                },
                "website": "hub.opensolaris.org/bin/view/Project+opengrok/WebHome"
            },
            "OpenLayers": {
                "cats": [
                    35
                ],
                "env": "^OpenLayers$",
                "script": "openlayers",
                "website": "openlayers.org"
            },
            "OpenNemas": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "OpenNemas"
                },
                "meta": {
                    "generator": "OpenNemas"
                },
                "website": "www.opennemas.com"
            },
            "OpenSSL": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "OpenSSL(?:/([\\d.]+[a-z]?))?\\;version:\\1"
                },
                "website": "openssl.org"
            },
            "OpenText Web Solutions": {
                "cats": [
                    1
                ],
                "html": "<!--[^>]+published by Open Text Web Solutions",
                "implies": "Microsoft ASP.NET",
                "website": "websolutions.opentext.com"
            },
            "Ophal": {
                "cats": [
                    1,
                    11,
                    18
                ],
                "headers": {
                    "X-Powered-By": "Ophal(?: (.*))? \\(ophal\\.org\\)\\;version:\\1"
                },
                "implies": "Lua",
                "meta": {
                    "generator": "Ophal(?: (.*))? \\(ophal\\.org\\)\\;version:\\1"
                },
                "script": "ophal\\.js",
                "website": "ophal.org"
            },
            "Optimizely": {
                "cats": [
                    10
                ],
                "env": "^optimizely$",
                "script": "optimizely\\.com.*\\.js",
                "website": "optimizely.com"
            },
            "Oracle Application Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Oracle[- ]Application[- ]Server(?: Containers for J2EE)?(?:[- ](\\d[\\da-z./]+))?\\;version:\\1"
                },
                "website": "www.oracle.com/technetwork/middleware/ias/overview/index.html"
            },
            "Oracle Dynamic Monitoring Service": {
                "cats": [
                    19
                ],
                "headers": {
                    "x-oracle-dms-ecid": ""
                },
                "website": "oracle.com"
            },
            "Oracle HTTP Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Oracle-HTTP-Server(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "oracle.com"
            },
            "Oracle Recommendations On Demand": {
                "cats": [
                    10
                ],
                "script": "atgsvcs.+atgsvcs\\.js",
                "website": "www.oracle.com/us/products/applications/commerce/recommendations-on-demand/index.html"
            },
            "Oracle Web Cache": {
                "cats": [
                    23
                ],
                "headers": {
                    "Server": "Oracle(?:AS)?[- ]Web[- ]Cache(?:[- /]([\\da-z./]+))?\\;version:\\1"
                },
                "website": "oracle.com"
            },
            "Orchard CMS": {
                "cats": [
                    1
                ],
                "implies": "Microsoft ASP.NET",
                "meta": {
                    "generator": "Orchard"
                },
                "website": "orchardproject.net"
            },
            "Outbrain": {
                "cats": [
                    5
                ],
                "env": "^(?:OutbrainPermaLink|OB_releaseVer)$",
                "script": "widgets\\.outbrain\\.com/outbrain\\.js",
                "website": "outbrain.com"
            },
            "Outlook Web App": {
                "cats": [
                    30
                ],
                "env": "^(?:(?:g_f)?Owa|IsOwaPremiumBrowser)$",
                "html": "<link\\s[^>]*href=\"[^\"]*?([\\d.]+)/themes/resources/owafont\\.css\\;version:\\1",
                "implies": "Microsoft ASP.NET",
                "url": "/owa/auth/log(?:on|off)\\.aspx",
                "website": "help.outlook.com"
            },
            "PANSITE": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "PANSITE"
                },
                "website": "panvision.de/Produkte/Content_Management/index.asp"
            },
            "PDF.js": {
                "cats": [
                    19
                ],
                "env": "^PDFJS$",
                "html": "<\\/div>\\s*<!-- outerContainer -->\\s*<div\\s*id=\"printContainer\"><\\/div>",
                "url": "/web/viewer\\.html?file=[^&]\\.pdf",
                "website": "mozilla.github.io/pdf.js/"
            },
            "PHP": {
                "cats": [
                    27
                ],
                "headers": {
                    "Server": "php/?([\\d.]+)?\\;confidence:40\\;version:\\1",
                    "Set-Cookie": "PHPSESSID",
                    "X-Powered-By": "php/?([\\d.]+)?\\;confidence:40\\;version:\\1"
                },
                "url": "\\.php(?:$|\\?)",
                "website": "php.net"
            },
            "PHP-Fusion": {
                "cats": [
                    1
                ],
                "html": "Powered by <a href=\"[^>]+php-fusion",
                "implies": "PHP",
                "website": "www.php-fusion.co.uk"
            },
            "PHP-Nuke": {
                "cats": [
                    2
                ],
                "html": "<[^>]+Powered by PHP-Nuke",
                "implies": "PHP",
                "meta": {
                    "generator": "PHP-Nuke"
                },
                "website": "phpnuke.org"
            },
            "Pagekit": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "Pagekit"
                },
                "website": "pagekit.com"
            },
            "Pardot": {
                "cats": [
                    32
                ],
                "env": "^pi(?:Tracker|Hostname|Protocol|CId|AId)$",
                "website": "pardot.com"
            },
            "Parse.ly": {
                "cats": [
                    10
                ],
                "env": "^PARSELY$",
                "website": "parse.ly"
            },
            "Paths.js": {
                "cats": [
                    25
                ],
                "script": "paths(\\.min)?\\.js",
                "website": "github.com/andreaferretti/paths-js"
            },
            "PayPal": {
                "cats": [
                    41
                ],
                "env": "^PAYPAL$",
                "html": "<input[^>]+_s-xclick",
                "script": "paypalobjects\\.com/js",
                "website": "paypal.com"
            },
            "PencilBlue": {
                "cats": [
                    1,
                    11
                ],
                "headers": {
                    "X-Powered-By": "PencilBlue"
                },
                "website": "pencilblue.org"
            },
            "Percussion": {
                "cats": [
                    1
                ],
                "html": "<[^>]+class=\"perc-region\"",
                "meta": {
                    "generator": "(?:Percussion|Rhythmyx)"
                },
                "website": "percussion.com"
            },
            "PerfSONAR-PS": {
                "cats": [
                    19
                ],
                "headers": {
                    "User-agent": "perfSONAR-PS/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "psps.perfsonar.net"
            },
            "Perl": {
                "cats": [
                    27
                ],
                "headers": {
                    "Server": "\bPerl\b(?: ?/?v?([\\d.]+))?\\;version:\\1"
                },
                "url": "\\.pl(?:$|\\?)",
                "website": "perl.org"
            },
            "Petrojs": {
                "cats": [
                    12
                ],
                "env": "^petrojs$",
                "script": [
                    "petrojs(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "(?:/([\\d.]+)/)?petrojs(?:\\.min)?\\.js\\;version:\\1"
                ],
                "website": "petrojs.thepetronics.com"
            },
            "Phaser": {
                "cats": [
                    12
                ],
                "env": "Phaser",
                "website": "phaser.io"
            },
            "Phusion Passenger": {
                "cats": [
                    22
                ],
                "headers": {
                    "X-Powered-By": "^Phusion Passenger"
                },
                "website": "phusionpassenger.com"
            },
            "Piano Solo": {
                "cats": [
                    43
                ],
                "env": "^PianoMedia$",
                "headers": {
                    "Set-Cookie": "pianovisitkey"
                },
                "website": "www.pianomedia.com/products"
            },
            "Piwik": {
                "cats": [
                    10
                ],
                "env": [
                    "^Piwik$",
                    "^_paq$"
                ],
                "headers": {
                    "Set-Cookie": "PIWIK_SESSID="
                },
                "meta": {
                    "apple-itunes-app": "app-id=737216887",
                    "generator": "Piwik - Open Source Web Analytics",
                    "google-play-app": "app-id=org\\.piwik\\.mobile2"
                },
                "script": "piwik\\.js|piwik\\.php",
                "website": "piwik.org"
            },
            "Planet": {
                "cats": [
                    49
                ],
                "meta": {
                    "generator": "^Planet(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "planetplanet.org"
            },
            "Plentymarkets": {
                "cats": [
                    6
                ],
                "meta": {
                    "generator": "plentymarkets"
                },
                "website": "plentymarkets.eu"
            },
            "Plesk": {
                "cats": [
                    9
                ],
                "headers": {
                    "X-Powered-By": "PleskLin",
                    "X-Powered-By-Plesk": "Plesk"
                },
                "script": "common\\.js\\?plesk",
                "website": "parallels.com/products/plesk"
            },
            "Pligg": {
                "cats": [
                    1
                ],
                "env": "^pligg_",
                "html": "<span[^>]+id=\"xvotes-0",
                "meta": {
                    "generator": "Pligg"
                },
                "website": "pligg.com"
            },
            "Plone": {
                "cats": [
                    1
                ],
                "implies": "Python",
                "meta": {
                    "generator": "Plone"
                },
                "website": "plone.org"
            },
            "Plura": {
                "cats": [
                    19
                ],
                "html": "<iframe src=\"[^>]+pluraserver\\.com",
                "website": "www.pluraprocessing.com"
            },
            "Po.st": {
                "cats": [
                    5
                ],
                "env": "^pwidget_config$",
                "website": "www.po.st/"
            },
            "Polymer": {
                "cats": [
                    12
                ],
                "env": "^Polymer$",
                "html": "(?:<polymer-[^>]+|<link[^>]+rel=\"import\"[^>]+/polymer\\.html\")",
                "script": "polymer\\.js",
                "website": "polymer-project.org"
            },
            "Posterous": {
                "cats": [
                    1,
                    11
                ],
                "env": "^Posterous",
                "html": "<div class=\"posterous",
                "website": "posterous.com"
            },
            "PostgreSQL": {
                "cats": [
                    34
                ],
                "website": "www.postgresql.org/"
            },
            "Powergap": {
                "cats": [
                    6
                ],
                "html": [
                    "<a[^>]+title=\"POWERGAP",
                    "<input type=\"hidden\" name=\"shopid\""
                ],
                "website": "powergap.de"
            },
            "Prefix-Free": {
                "cats": [
                    19
                ],
                "env": "^PrefixFree$",
                "script": "prefixfree\\.js",
                "website": "leaverou.github.io/prefixfree/"
            },
            "PrestaShop": {
                "cats": [
                    6
                ],
                "html": "Powered by <a\\s+[^>]+>PrestaShop",
                "implies": "PHP",
                "meta": {
                    "generator": "PrestaShop"
                },
                "website": "www.prestashop.com"
            },
            "Project Wonderful": {
                "cats": [
                    36
                ],
                "env": "^pw_adloader$",
                "html": "<div[^>]+id=\"pw_adbox_",
                "script": "^https?://(?:www\\.)?projectwonderful\\.com/(?:pwa\\.js|gen\\.php)",
                "website": "projectwonderful.com"
            },
            "Prototype": {
                "cats": [
                    12
                ],
                "env": "^Prototype$",
                "script": "(?:prototype|protoaculous)(?:-([\\d.]*[\\d]))?.*\\.js\\;version:\\1",
                "website": "www.prototypejs.org"
            },
            "Protovis": {
                "cats": [
                    25
                ],
                "env": "^protovis$",
                "script": "protovis.*\\.js",
                "website": "mbostock.github.com/protovis"
            },
            "Pure CSS": {
                "cats": [
                    18
                ],
                "html": "<link[^>]+(?:([\\d.])+/)?pure(?:-min)?\\.css\\;version:\\1",
                "website": "purecss.io"
            },
            "Python": {
                "cats": [
                    27
                ],
                "headers": {
                    "Server": "(?:^|\\s)Python(?:/([\\d.]+))?\\;confidence:50\\;version:\\1"
                },
                "website": "python.org"
            },
            "Quantcast": {
                "cats": [
                    10
                ],
                "env": "^quantserve$",
                "script": "edge\\.quantserve\\.com/quant\\.js",
                "website": "www.quantcast.com"
            },
            "Quick.CMS": {
                "cats": [
                    1
                ],
                "html": "<a href=\"[^>]+opensolution\\.org/\">CMS by",
                "meta": {
                    "generator": "Quick\\.CMS(?: v([\\d.]+))?\\;version:\\1"
                },
                "website": "opensolution.org"
            },
            "Quick.Cart": {
                "cats": [
                    6
                ],
                "html": "<a href=\"[^>]+opensolution\\.org/\">(?:Shopping cart by|Sklep internetowy)",
                "meta": {
                    "generator": "Quick\\.Cart(?: v([\\d.]+))?\\;version:\\1"
                },
                "website": "opensolution.org"
            },
            "Quill": {
                "cats": [
                    24
                ],
                "env": "^Quill$",
                "website": "quilljs.com"
            },
            "RAID HTTPServer": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "RAID HTTPServer(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "???"
            },
            "RBS Change": {
                "cats": [
                    1,
                    6
                ],
                "html": "<html[^>]+xmlns:change=",
                "implies": "PHP",
                "meta": {
                    "generator": "RBS Change"
                },
                "website": "www.rbschange.fr"
            },
            "RCMS": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "^(?:RCMS|ReallyCMS)"
                },
                "website": "www.rcms.fi"
            },
            "RDoc": {
                "cats": [
                    4
                ],
                "html": [
                    "<link[^>]+href=\"[^\"]*rdoc-style\\.css",
                    "Generated by <a[^>]+href=\"https?://rdoc\\.rubyforge\\.org[^>]+>RDoc</a> ([\\d.]*\\d)\\;version:\\1"
                ],
                "implies": "Ruby",
                "website": "github.com/RDoc/RDoc"
            },
            "RackCache": {
                "cats": [
                    23
                ],
                "headers": {
                    "X-Rack-Cache": ""
                },
                "implies": "Ruby",
                "website": "github.com/rtomayko/rack-cache"
            },
            "Ramda": {
                "cats": [
                    12
                ],
                "script": "ramda.*\\.js",
                "website": "ramdajs.com"
            },
            "Raphael": {
                "cats": [
                    25
                ],
                "env": "^Raphael$",
                "script": "raphael.*\\.js",
                "website": "raphaeljs.com"
            },
            "Rapid Logic": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Rapid Logic(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "???"
            },
            "React": {
                "cats": [
                    12
                ],
                "env": "^React$",
                "script": [
                    "react(?:\\-with\\-addons)?(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "/([\\d.]+)/react(\\.min)?\\.js\\;version:\\1",
                    "react.*\\.js"
                ],
                "website": "facebook.github.io/react"
            },
            "Red Hat": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Red Hat",
                    "X-Powered-By": "Red Hat"
                },
                "website": "redhat.com"
            },
            "Reddit": {
                "cats": [
                    2
                ],
                "env": "^reddit$",
                "html": "(?:<a[^>]+Powered by Reddit|powered by <a[^>]+>reddit<)",
                "implies": "Python",
                "url": "^(?:www\\.)?reddit\\.com",
                "website": "code.reddit.com"
            },
            "Redmine": {
                "cats": [
                    13
                ],
                "html": "Powered by <a href=\"[^>]+Redmine",
                "implies": "Ruby on Rails",
                "meta": {
                    "description": "Redmine"
                },
                "website": "www.redmine.org"
            },
            "Reinvigorate": {
                "cats": [
                    10
                ],
                "env": "^reinvigorate$",
                "website": "www.reinvigorate.net"
            },
            "RequireJS": {
                "cats": [
                    12
                ],
                "env": "^requirejs$",
                "script": "require.*\\.js",
                "website": "requirejs.org"
            },
            "Reveal.js": {
                "cats": [
                    12
                ],
                "env": "^Reveal$",
                "script": "reveal(?:\\.min)?\\.js",
                "website": "lab.hakim.se/reveal-js"
            },
            "Rickshaw": {
                "cats": [
                    25
                ],
                "env": "^Rickshaw$",
                "implies": "D3",
                "script": "rickshaw(\\.min)?\\.js",
                "website": "code.shutterstock.com/rickshaw/"
            },
            "RightJS": {
                "cats": [
                    12
                ],
                "env": "^RightJS$",
                "script": "right\\.js",
                "website": "rightjs.org"
            },
            "Riot": {
                "cats": [
                    12
                ],
                "env": "^riot$",
                "script": "riot(?:\\+compiler)?(:?\\.min)?\\.js",
                "website": "muut.com/riotjs"
            },
            "RiteCMS": {
                "cats": [
                    1
                ],
                "implies": [
                    "PHP",
                    "SQLite\\;confidence:50"
                ],
                "meta": {
                    "generator": "^RiteCMS(?: (.+))?\\;version:\\1"
                },
                "website": "ritecms.com"
            },
            "Roadiz CMS": {
                "cats": [
                    1,
                    11
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "^Roadiz ([a-z0-9\\s\\.]+) - \\;version:\\1"
                },
                "website": "www.roadiz.io"
            },
            "RoundCube": {
                "cats": [
                    30
                ],
                "env": "^(?:rcmail|rcube_|roundcube)",
                "html": "<title>RoundCube",
                "implies": "PHP",
                "website": "roundcube.net"
            },
            "Ruby": {
                "cats": [
                    27
                ],
                "headers": {
                    "Server": "(?:Mongrel|WEBrick|Ruby)"
                },
                "website": "ruby-lang.org"
            },
            "Ruby on Rails": {
                "cats": [
                    18
                ],
                "headers": {
                    "Server": "(?:mod_rails|mod_rack|Phusion(?:\\.|_)Passenger)\\;confidence:50",
                    "X-Powered-By": "(?:mod_rails|mod_rack|Phusion[\\._ ]Passenger)(?: \\(mod_rails/mod_rack\\))?(?: ?/?([\\d\\.]+))?\\;version:\\1\\;confidence:50"
                },
                "implies": "Ruby",
                "meta": {
                    "csrf-param": "authenticity_token\\;confidence:50"
                },
                "script": "/assets/application-[a-z\\d]{32}/\\.js\\;confidence:50",
                "website": "rubyonrails.org"
            },
            "RxJS": {
                "cats": [
                    12
                ],
                "env": "^Rx$\\;confidence:20",
                "script": "rx(?:\\.\\w+)?(?:\\.compat)?(?:\\.min)?\\.js",
                "website": "reactive-extensions.github.io/RxJS/"
            },
            "S.Builder": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "S\\.Builder"
                },
                "website": "www.sbuilder.ru"
            },
            "SAP": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "SAP NetWeaver Application Server"
                },
                "website": "sap.com"
            },
            "SDL Tridion": {
                "cats": [
                    1
                ],
                "html": "<img[^>]+_tcm\\d{2,3}-\\d{6}\\.",
                "website": "www.sdl.com/products/tridion"
            },
            "SIMsite": {
                "cats": [
                    1
                ],
                "meta": {
                    "SIM.medium": ""
                },
                "script": "/sim(?:site|core)/js",
                "website": "simgroep.nl/internet/portfolio-contentbeheer_41623/"
            },
            "SMF": {
                "cats": [
                    2
                ],
                "env": "^smf_",
                "implies": "PHP",
                "website": "www.simplemachines.org"
            },
            "SOBI 2": {
                "cats": [
                    19
                ],
                "html": "(?:<!-- start of Sigsiu Online Business Index|<div[^>]* class=\"sobi2)",
                "implies": "Joomla",
                "website": "www.sigsiu.net/sobi2.html"
            },
            "SPDY": {
                "cats": [
                    19
                ],
                "headers": {
                    "X-Firefox-Spdy": ""
                },
                "website": "chromium.org/spdy"
            },
            "SPIP": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Spip-Cache": ""
                },
                "meta": {
                    "generator": "(?:^|\\s)SPIP(?:\\s([\\d.]+(?:\\s\\[\\d+\\])?))?\\;version:\\1"
                },
                "website": "www.spip.net"
            },
            "SQL Buddy": {
                "cats": [
                    3
                ],
                "html": "(?:<title>SQL Buddy</title>|<[^>]+onclick=\"sideMainClick\\(\"home\\.php)",
                "website": "www.sqlbuddy.com"
            },
            "SQLite": {
                "cats": [
                    34
                ],
                "website": "www.sqlite.org"
            },
            "SUSE": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "SUSE(?:/?\\s?-?([\\d.]+))?\\;version:\\1",
                    "X-Powered-By": "SUSE(?:/?\\s?-?([\\d.]+))?\\;version:\\1"
                },
                "website": "suse.com"
            },
            "SWFObject": {
                "cats": [
                    19
                ],
                "env": "^SWFObject$",
                "script": "swfobject.*\\.js",
                "website": "blog.deconcept.com/swfobject"
            },
            "Saia PCD": {
                "cats": [
                    45
                ],
                "headers": {
                    "Server": "Saia PCD(?:([/a-z\\d.]+))?\\;version:\\1"
                },
                "website": "saia-pcd.com"
            },
            "Sarka-SPIP": {
                "cats": [
                    1
                ],
                "implies": "SPIP",
                "meta": {
                    "generator": "Sarka-SPIP(?:\\s([\\d.]+))?\\;version:\\1"
                },
                "website": "sarka-spip.net"
            },
            "Scala": {
                "cats": [
                    27
                ],
                "website": "www.scala-lang.org"
            },
            "Schneider": {
                "cats": [
                    45
                ],
                "website": "schneider-electric.com"
            },
            "Schneider Web Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Schneider-WEB(?:/V?([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Schneider"
                ],
                "website": "schneider-electric.com"
            },
            "Scientific Linux": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Scientific Linux",
                    "X-Powered-By": "Scientific Linux"
                },
                "website": "scientificlinux.org"
            },
            "Sencha Touch": {
                "cats": [
                    12,
                    26
                ],
                "script": "sencha-touch.*\\.js",
                "website": "sencha.com/products/touch"
            },
            "Sentinel Keys Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "SentinelKeysServer\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "www.safenet-inc.com/software-monetization/sentinel-rms"
            },
            "Sentinel License Monitor": {
                "cats": [
                    19
                ],
                "html": "<title>Sentinel (?:Keys )?License Monitor</title>",
                "website": "www.safenet-inc.com/software-monetization/sentinel-rms/"
            },
            "Sentinel Protection Server": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "SentinelProtectionServer\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "www.safenet-inc.com/software-monetization/sentinel-rms/"
            },
            "Seoshop": {
                "cats": [
                    6
                ],
                "html": "<a[^>]+title=\"SEOshop",
                "website": "getseoshop.com"
            },
            "Serendipity": {
                "cats": [
                    1,
                    11
                ],
                "implies": "PHP",
                "meta": {
                    "Powered-By": "Serendipity v\\.(.+)\\;version:\\1",
                    "generator": "Serendipity"
                },
                "website": "s9y.org"
            },
            "Shadow": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "ShadowFramework"
                },
                "implies": "PHP",
                "website": "shadow-technologies.co.uk"
            },
            "ShareThis": {
                "cats": [
                    5
                ],
                "env": "^SHARETHIS$",
                "script": "w\\.sharethis\\.com/",
                "website": "sharethis.com"
            },
            "ShinyStat": {
                "cats": [
                    10
                ],
                "env": "^SSsdk$",
                "html": "<img[^>]*\\s+src=['\"]?https?://www\\.shinystat\\.com/cgi-bin/shinystat\\.cgi\\?[^'\"\\s>]*['\"\\s/>]",
                "script": "^https?://codice(?:business|ssl|pro|isp)?\\.shinystat\\.com/cgi-bin/getcod\\.cgi",
                "website": "shinystat.com"
            },
            "Shopalize": {
                "cats": [
                    5,
                    10
                ],
                "env": "^Shopalize$",
                "website": "shopalize.com"
            },
            "Shopatron": {
                "cats": [
                    6
                ],
                "env": "^shptUrl$",
                "html": [
                    "<body class=\"shopatron",
                    "<img[^>]+mediacdn\\.shopatron\\.com\\;confidence:50"
                ],
                "meta": {
                    "keywords": "Shopatron"
                },
                "script": "mediacdn\\.shopatron\\.com",
                "website": "ecommerce.shopatron.com"
            },
            "Shopify": {
                "cats": [
                    6
                ],
                "env": "^Shopify$",
                "html": "<link[^>]+=['\"]//cdn\\.shopify\\.com",
                "website": "shopify.com"
            },
            "Shopware": {
                "cats": [
                    6
                ],
                "implies": "PHP",
                "meta": {
                    "application-name": "Shopware"
                },
                "script": "shopware\\.js",
                "website": "shopware.com"
            },
            "Silva": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "SilvaCMS"
                },
                "website": "silvacms.org"
            },
            "SilverStripe": {
                "cats": [
                    1
                ],
                "html": "Powered by <a href=\"[^>]+SilverStripe",
                "meta": {
                    "generator": "SilverStripe"
                },
                "website": "www.silverstripe.org"
            },
            "SimpleHTTP": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "SimpleHTTP(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "???"
            },
            "Site Meter": {
                "cats": [
                    10
                ],
                "script": "sitemeter\\.com/js/counter\\.js\\?site=",
                "website": "www.sitemeter.com"
            },
            "SiteCatalyst": {
                "cats": [
                    10
                ],
                "env": "^s_(?:account|objectID|code|INST)$",
                "script": "/s[_-]code.*\\.js",
                "website": "www.adobe.com/solutions/digital-marketing.html"
            },
            "SiteEdit": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "SiteEdit"
                },
                "website": "www.siteedit.ru"
            },
            "Sitecore": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-cookie": "SC_ANALYTICS_GLOBAL_COOKIE"
                },
                "html": "<img[^>]+src=\"[^>]*/~/media/[^>]+\\.ashx",
                "website": "sitecore.net"
            },
            "Sivuviidakko": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "Sivuviidakko"
                },
                "website": "sivuviidakko.fi"
            },
            "Sizmek": {
                "cats": [
                    36
                ],
                "html": "(?:<a [^>]*href=\"[^/]*//[^/]*serving-sys\\.com/|<img [^>]*src=\"[^/]*//[^/]*serving-sys\\.com/)",
                "script": "[^/]*//[^/]*serving-sys\\.com/",
                "website": "sizmek.com"
            },
            "Slimbox": {
                "cats": [
                    7,
                    12
                ],
                "html": "<link [^>]*href=\"[^/]*slimbox(?:-rtl)?\\.css",
                "implies": "MooTools",
                "script": "slimbox\\.js",
                "website": "www.digitalia.be/software/slimbox"
            },
            "Slimbox 2": {
                "cats": [
                    7,
                    12
                ],
                "html": "<link [^>]*href=\"[^/]*slimbox2(?:-rtl)?\\.css",
                "implies": "jQuery",
                "script": "slimbox2\\.js",
                "website": "www.digitalia.be/software/slimbox2"
            },
            "Smart Ad Server": {
                "cats": [
                    36
                ],
                "env": "^SmartAdServer$",
                "html": "<img[^>]+smartadserver\\.com\\/call",
                "website": "smartadserver.com"
            },
            "SmartSite": {
                "cats": [
                    1
                ],
                "html": "<[^>]+/smartsite\\.(?:dws|shtml)\\?id=",
                "meta": {
                    "author": "Redacteur SmartInstant"
                },
                "website": "www.seneca.nl/pub/Smartsite/Smartsite-Smartsite-iXperion"
            },
            "Smartstore": {
                "cats": [
                    6
                ],
                "script": "smjslib\\.js",
                "website": "smartstore.com"
            },
            "Snap": {
                "cats": [
                    18,
                    22
                ],
                "headers": {
                    "Server": "Snap/\\d+(\\.\\d+)+"
                },
                "implies": "Haskell",
                "website": "snapframework.com"
            },
            "Snap.svg": {
                "cats": [
                    12
                ],
                "env": "^Snap$",
                "script": "snap\\.svg(?:-min)?\\.js",
                "website": "snapsvg.io"
            },
            "Snoobi": {
                "cats": [
                    10
                ],
                "env": "^snoobi$",
                "script": "snoobi\\.com/snoop\\.php",
                "website": "www.snoobi.com"
            },
            "SobiPro": {
                "cats": [
                    19
                ],
                "env": "^SobiProUrl$",
                "implies": "Joomla",
                "website": "sigsiu.net/sobipro.html"
            },
            "Socket.io": {
                "cats": [
                    12
                ],
                "env": "^io$",
                "implies": "node.js",
                "script": "socket.io.*\\.js",
                "website": "socket.io"
            },
            "Solodev": {
                "cats": [
                    1
                ],
                "headers": {
                    "solodev_session": ""
                },
                "html": "<div class='dynamicDiv' id='dd\\.\\d\\.\\d'>",
                "implies": "PHP",
                "website": "www.solodev.com"
            },
            "Solr": {
                "cats": [
                    34
                ],
                "implies": "Lucene",
                "website": "lucene.apache.org/solr/"
            },
            "SoundManager": {
                "cats": [
                    12
                ],
                "env": "^(?:SoundManager|BaconPlayer)$",
                "website": "www.schillmania.com/projects/soundmanager2"
            },
            "Sphinx": {
                "cats": [
                    4
                ],
                "env": "^DOCUMENTATION_OPTIONS$",
                "implies": "Python",
                "website": "sphinx.pocoo.org"
            },
            "SpiderControl iniNet": {
                "cats": [
                    45
                ],
                "meta": {
                    "generator": "iniNet SpiderControl"
                },
                "website": "spidercontrol.net/ininet"
            },
            "Splunk": {
                "cats": [
                    19
                ],
                "html": "<p class=\"footer\">&copy; [-\\d]+ Splunk Inc\\.(?: Splunk ([\\d\\.]+( build [\\d\\.]*\\d)?))?[^<]*</p>\\;version:\\1",
                "meta": {
                    "author": "Splunk Inc\\;confidence:50"
                },
                "website": "splunk.com"
            },
            "Splunkd": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Splunkd"
                },
                "website": "splunk.com"
            },
            "Spree": {
                "cats": [
                    6
                ],
                "html": "(?:<link[^>]*/assets/store/all-[a-z\\d]{32}\\.css[^>]+>|<script>\\s*Spree\\.(?:routes|translations|api_key))",
                "implies": "Ruby on Rails",
                "website": "spreecommerce.com"
            },
            "Squarespace": {
                "cats": [
                    1
                ],
                "env": "^Squarespace",
                "headers": {
                    "X-ServedBy": "squarespace"
                },
                "website": "www.squarespace.com"
            },
            "SquirrelMail": {
                "cats": [
                    30
                ],
                "env": "^squirrelmail_loginpage_onload$",
                "html": "<small>SquirrelMail version ([.\\d]+)[^<]*<br \\;version:\\1",
                "implies": "PHP",
                "url": "/src/webmail\\.php(?:$|\\?)",
                "website": "squirrelmail.org"
            },
            "Squiz Matrix": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "Squiz Matrix"
                },
                "html": "<!--\\s+Running (?:MySource|Squiz) Matrix",
                "implies": "PHP",
                "meta": {
                    "generator": "Squiz Matrix"
                },
                "website": "squiz.net"
            },
            "Starlet": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "^Plack::Handler::Starlet"
                },
                "implies": "Perl",
                "website": "metacpan.org/pod/Starlet"
            },
            "StatCounter": {
                "cats": [
                    10
                ],
                "script": "statcounter\\.com/counter/counter",
                "website": "www.statcounter.com"
            },
            "Store Systems": {
                "cats": [
                    6
                ],
                "html": "Shopsystem von <a href=[^>]+store-systems\\.de\"|\\.mws_boxTop",
                "website": "store-systems.de"
            },
            "Stripe": {
                "cats": [
                    41
                ],
                "env": "^Stripe$",
                "html": "<input[^>]+data-stripe",
                "script": "js\\.stripe\\.com",
                "website": "stripe.com"
            },
            "SublimeVideo": {
                "cats": [
                    14
                ],
                "env": "^sublimevideo$",
                "script": "cdn\\.sublimevideo\\.net/js/[a-z\\d]+\\.js",
                "website": "sublimevideo.net"
            },
            "Subrion": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-CMS": "Subrion CMS"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "^Subrion "
                },
                "website": "subrion.com"
            },
            "SunOS": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "SunOS( [\\d\\.]+)?\\;version:\\1",
                    "Servlet-engine": "SunOS( [\\d\\.]+)?\\;version:\\1"
                },
                "website": "oracle.com/solaris"
            },
            "Supersized": {
                "cats": [
                    7,
                    25
                ],
                "script": "supersized(?:\\.([\\d.]*[\\d]))?.*\\.js\\;version:\\1",
                "website": "buildinternet.com/project/supersized"
            },
            "SweetAlert": {
                "cats": [
                    12
                ],
                "env": "^swal$",
                "html": "<link[^>]+?href=\"[^\"]+sweet-alert(?:\\.min)?\\.css",
                "script": "sweet-alert(\\.min)?\\.js",
                "website": "tristanedwards.me/sweetalert"
            },
            "Swiftlet": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Generator": "Swiftlet",
                    "X-Powered-By": "Swiftlet",
                    "X-Swiftlet-Cache": ""
                },
                "html": "Powered by <a href=\"[^>]+Swiftlet",
                "implies": "PHP",
                "meta": {
                    "generator": "Swiftlet"
                },
                "website": "swiftlet.org"
            },
            "Symfony": {
                "cats": [
                    18
                ],
                "implies": "PHP",
                "website": "symfony.com"
            },
            "Synology DiskStation": {
                "cats": [
                    48
                ],
                "meta": {
                    "application-name": "Synology DiskStation"
                },
                "website": "synology.com"
            },
            "SyntaxHighlighter": {
                "cats": [
                    19
                ],
                "html": "(<script|<link)[^>]*sh(Core|Brush|ThemeDefault)",
                "website": "github.com/syntaxhighlighter"
            },
            "TWiki": {
                "cats": [
                    8
                ],
                "headers": {
                    "Set-cookie": "TWIKISID"
                },
                "html": "<img [^>]*(?:title|alt)=\"This site is powered by the TWiki collaboration platform",
                "script": "(?:TWikiJavascripts|twikilib(?:\\.min)?\\.js)",
                "website": "twiki.org"
            },
            "TYPO3 CMS": {
                "cats": [
                    1
                ],
                "html": "<(?:script[^>]+ src|link[^>]+ href)=[^>]+typo3temp/",
                "implies": "PHP",
                "meta": {
                    "generator": "TYPO3\\s+(?:CMS\\s+)?([\\d.]+)?(?:\\s+CMS)?\\;version:\\1"
                },
                "url": "/typo3/",
                "website": "www.typo3.org"
            },
            "TYPO3 Flow": {
                "cats": [
                    18
                ],
                "excludes": "TYPO3 CMS",
                "headers": {
                    "X-Flow-Powered": "Flow/?(.+)?$\\;version:\\1"
                },
                "implies": "PHP",
                "website": "flow.typo3.org"
            },
            "TYPO3 Neos": {
                "cats": [
                    1
                ],
                "excludes": "TYPO3 CMS",
                "html": "<html[^>]+xmlns:typo3=\"[^\"]+Flow/Packages/Neos/",
                "implies": [
                    "PHP",
                    "TYPO3 Flow"
                ],
                "url": "/neos/",
                "website": "neos.typo3.org"
            },
            "Tealeaf": {
                "cats": [
                    10
                ],
                "env": "^TeaLeaf$",
                "website": "www.tealeaf.com"
            },
            "TeamCity": {
                "cats": [
                    44
                ],
                "html": "<span class=\"versionTag\"><span class=\"vWord\">Version</span> ([\\d\\.]+)\\;version:\\1",
                "implies": [
                    "jQuery",
                    "Prototype"
                ],
                "meta": {
                    "application-name": "TeamCity"
                },
                "website": "jetbrains.com/teamcity"
            },
            "Tengine": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Tengine"
                },
                "website": "tengine.taobao.org"
            },
            "Textpattern CMS": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "Textpattern"
                },
                "website": "textpattern.com"
            },
            "Thelia": {
                "cats": [
                    1,
                    6
                ],
                "headers": {
                    "Set-Cookie": "thelia_cart="
                },
                "implies": [
                    "PHP",
                    "Symfony"
                ],
                "meta": {
                    "generator": "Thelia v([\\d.]+)\\;version:\\1"
                },
                "website": "www.thelia.net"
            },
            "TiddlyWiki": {
                "cats": [
                    1,
                    2,
                    4,
                    8
                ],
                "env": "tiddler",
                "html": "<[^>]*type=[^>]text\\/vnd\\.tiddlywiki",
                "meta": {
                    "application-name": "^TiddlyWiki$",
                    "copyright": "^TiddlyWiki created by Jeremy Ruston",
                    "generator": "^TiddlyWiki$",
                    "tiddlywiki-version": "(.*)\\;version:\\1"
                },
                "website": "tiddlywiki.com"
            },
            "Tiki Wiki CMS Groupware": {
                "cats": [
                    1,
                    2,
                    8,
                    11,
                    13
                ],
                "meta": {
                    "generator": "^Tiki"
                },
                "script": "(?:/|_)tiki",
                "website": "tiki.org"
            },
            "Timeplot": {
                "cats": [
                    25
                ],
                "env": "^Timeplot$",
                "script": "timeplot.*\\.js",
                "website": "www.simile-widgets.org/timeplot/"
            },
            "TinyMCE": {
                "cats": [
                    24
                ],
                "env": "^tinyMCE$",
                "website": "tinymce.com"
            },
            "Titan": {
                "cats": [
                    36
                ],
                "env": [
                    "^titan$",
                    "^titanEnabled$"
                ],
                "html": "<script[^>]+>var titan",
                "website": "titan360.com"
            },
            "TomatoCart": {
                "cats": [
                    6
                ],
                "env": "^AjaxShoppingCart$",
                "meta": {
                    "generator": "TomatoCart"
                },
                "website": "tomatocart.com"
            },
            "TornadoServer": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "TornadoServer(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "tornadoweb.org"
            },
            "Trac": {
                "cats": [
                    13
                ],
                "html": [
                    "<a id=\"tracpowered",
                    "Powered by <a href=\"[^\"]*\"><strong>Trac(?:[ /]([\\d.]+))?\\;version:\\1"
                ],
                "implies": "Python",
                "website": "trac.edgewall.org"
            },
            "TrackJs": {
                "cats": [
                    10
                ],
                "env": "^TrackJs$",
                "script": "tracker.js",
                "website": "trackjs.com"
            },
            "Tumblr": {
                "cats": [
                    11
                ],
                "headers": {
                    "X-Tumblr-User": ""
                },
                "html": "<iframe src=\"[^>]+tumblr\\.com",
                "url": "^https?://(?:www\\.)?[^/]+\\.tumblr\\.com/",
                "website": "www.tumblr.com"
            },
            "TweenMax": {
                "cats": [
                    12
                ],
                "env": "^TweenMax$",
                "script": "TweenMax(?:\\.min)?\\.js",
                "website": "greensock.com/tweenmax"
            },
            "Twilight CMS": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-CMS": "Twilight CMS"
                },
                "website": "www.twilightcms.com"
            },
            "TwistPHP": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "TwistPHP"
                },
                "implies": "PHP",
                "website": "twistphp.com"
            },
            "TwistedWeb": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "TwistedWeb(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "twistedmatrix.com/trac/wiki/TwistedWeb"
            },
            "Twitter Bootstrap": {
                "cats": [
                    18
                ],
                "env": "^Twipsy$\\;confidence:50",
                "html": [
                    "<style>/\\*!\\* Bootstrap v(\\d\\.\\d\\.\\d)\\;version:\\1",
                    "<link[^>]+?href=\"[^\"]+bootstrap(?:\\.min)?\\.css",
                    "<div [^>]*class=\"[^\"]*col-(?:xs|sm|md|lg)-\\d{1,2}"
                ],
                "script": "(?:twitter\\.github\\.com/bootstrap|bootstrap(?:\\.js|\\.min\\.js))",
                "website": "getbootstrap.com"
            },
            "Twitter Emoji (Twemoji)": {
                "cats": [
                    25
                ],
                "env": "^twemoji$",
                "script": "twemoji(\\.min)?\\.js",
                "website": "twitter.github.io/twemoji/"
            },
            "Twitter Flight": {
                "cats": [
                    12
                ],
                "env": "^flight$",
                "implies": "jQuery",
                "website": "flightjs.github.io/"
            },
            "Twitter typeahead.js": {
                "cats": [
                    12
                ],
                "env": "^typeahead$",
                "implies": "jQuery\\;confidence:50",
                "script": "(typeahead|bloodhound)(\\.jquery|\\.bundle)?(\\.min)?\\.js",
                "website": "twitter.github.io/typeahead.js"
            },
            "TypePad": {
                "cats": [
                    11
                ],
                "meta": {
                    "generator": "typepad"
                },
                "url": "typepad\\.com",
                "website": "www.typepad.com"
            },
            "Typekit": {
                "cats": [
                    17
                ],
                "env": "^Typekit$",
                "script": "use\\.typekit\\.com",
                "website": "typekit.com"
            },
            "UIKit": {
                "cats": [
                    18
                ],
                "script": "uikit.*\\.js",
                "website": "getuikit.com"
            },
            "UNIX": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Unix"
                },
                "website": "unix.org"
            },
            "Ubercart": {
                "cats": [
                    6
                ],
                "implies": "Drupal",
                "script": "uc_cart/uc_cart_block\\.js",
                "website": "www.ubercart.org"
            },
            "Ubuntu": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Ubuntu",
                    "X-Powered-By": "Ubuntu"
                },
                "website": "ubuntu.com/business/server/overview"
            },
            "UltraCart": {
                "cats": [
                    6
                ],
                "env": "^ucCatalog",
                "html": "<form [^>]*action=\"[^\"]*\\/cgi-bin\\/UCEditor\\?(?:[^\"]*&)?merchantId=[^\"]",
                "script": "cgi-bin\\/UCJavaScript\\?(?:[^\"]*&)?merchantid=.",
                "url": "/cgi-bin/UCEditor\\?(?:.*&)?merchantid=.",
                "website": "ultracart.com"
            },
            "Umbraco": {
                "cats": [
                    1
                ],
                "env": "^(?:UC_(?:IMAGE_SERVICE|ITEM_INFO_SERVICE|SETTINGS)|Umbraco)$",
                "headers": {
                    "X-Umbraco-Version": "(.*)\\;version:\\1"
                },
                "html": "powered by <a href=[^>]+umbraco",
                "implies": "Microsoft ASP.NET",
                "meta": {
                    "generator": "umbraco"
                },
                "url": "/umbraco/login\\.aspx(?:$|\\?)",
                "website": "umbraco.com"
            },
            "Unbounce": {
                "cats": [
                    1,
                    20
                ],
                "headers": {
                    "X-Unbounce-PageId": ""
                },
                "website": "unbounce.com"
            },
            "Underscore.js": {
                "cats": [
                    12
                ],
                "script": "underscore.*\\.js",
                "website": "documentcloud.github.com/underscore"
            },
            "UserRules": {
                "cats": [
                    13
                ],
                "env": "^_usrp$",
                "website": "www.userrules.com"
            },
            "UserVoice": {
                "cats": [
                    13
                ],
                "env": "^UserVoice$",
                "website": "uservoice.com"
            },
            "Ushahidi": {
                "cats": [
                    1,
                    35
                ],
                "env": "^Ushahidi$",
                "headers": {
                    "Set-Cookie": "^ushahidi="
                },
                "implies": [
                    "PHP",
                    "MySQL",
                    "OpenLayers"
                ],
                "script": "/js/ushahidi\\.js$",
                "website": "www.ushahidi.com"
            },
            "VIVVO": {
                "cats": [
                    1
                ],
                "env": "^vivvo",
                "headers": {
                    "Set-Cookie": "VivvoSessionId"
                },
                "website": "vivvo.net"
            },
            "VP-ASP": {
                "cats": [
                    6
                ],
                "html": "<a[^>]+>Powered By VP-ASP Shopping Cart</a>",
                "implies": "Microsoft ASP.NET",
                "script": "vs350\\.js",
                "website": "www.vpasp.com"
            },
            "Vanilla": {
                "cats": [
                    2
                ],
                "headers": {
                    "X-Powered-By": "Vanilla"
                },
                "html": "<body id=\"(?:DiscussionsPage|vanilla)",
                "implies": "PHP",
                "website": "vanillaforums.org"
            },
            "Varnish": {
                "cats": [
                    23
                ],
                "headers": {
                    "Via": ".*Varnish",
                    "X-Varnish": "",
                    "X-Varnish-Action": "",
                    "X-Varnish-Age": "",
                    "X-Varnish-Cache": "",
                    "X-Varnish-Hostname": ""
                },
                "website": "www.varnish-cache.org"
            },
            "Venda": {
                "cats": [
                    6
                ],
                "headers": {
                    "X-venda-hitid": ""
                },
                "website": "venda.com"
            },
            "Veoxa": {
                "cats": [
                    36
                ],
                "env": "^(?:Veoxa_|VuVeoxaContent)",
                "html": "<img [^>]*src=\"[^\"]+tracking\\.veoxa\\.com",
                "script": "tracking\\.veoxa\\.com",
                "website": "veoxa.com"
            },
            "VideoJS": {
                "cats": [
                    14
                ],
                "env": "^VideoJS$",
                "html": "<div[^>]+class=\"video-js+\">",
                "script": "zencdn\\.net/c/video\\.js",
                "website": "videojs.com"
            },
            "VigLink": {
                "cats": [
                    36
                ],
                "env": "^(?:vglnk(?:$|_)|vl_(?:cB|disable)$)",
                "script": "(?:^[^/]*//[^/]*viglink\\.com/api/|vglnk\\.js)",
                "website": "viglink.com"
            },
            "Vignette": {
                "cats": [
                    1
                ],
                "html": "<[^>]+=\"vgn-?ext",
                "website": "www.vignette.com"
            },
            "Vimeo": {
                "cats": [
                    14
                ],
                "html": "(?:<(?:param|embed)[^>]+vimeo\\.com/moogaloop|<iframe[^>]player\\.vimeo\\.com)",
                "website": "vimeo.com"
            },
            "Virata EmWeb": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Virata-EmWeb(?:/(R?[\\d._]+))?\\;version:\\1"
                },
                "implies": [
                    "HP"
                ],
                "website": "???"
            },
            "VirtueMart": {
                "cats": [
                    6
                ],
                "html": "<div id=\"vmMainPage",
                "implies": "Joomla",
                "website": "virtuemart.net"
            },
            "Visual WebGUI": {
                "cats": [
                    18
                ],
                "env": "^VWGEventArgs$",
                "implies": "Microsoft ASP.NET",
                "meta": {
                    "generator": "^Visual WebGUI"
                },
                "script": "\\.js\\.wgx$",
                "url": "\\.wgx$",
                "website": "www.gizmox.com/products/visual-web-gui/"
            },
            "VisualPath": {
                "cats": [
                    10
                ],
                "script": "visualpath[^/]*\\.trackset\\.it/[^/]+/track/include\\.js",
                "website": "www.trackset.com/web-analytics-software/visualpath"
            },
            "Volusion": {
                "cats": [
                    6
                ],
                "env": "^volusion$",
                "html": "<link [^>]*href=\"[^\"]*/vspfiles/",
                "script": "/volusion\\.js(?:\\?([\\d.]*))?\\;version:\\1",
                "website": "volusion.com"
            },
            "Vox": {
                "cats": [
                    11
                ],
                "url": "\\.vox\\.com",
                "website": "www.vox.com"
            },
            "Vue.js": {
                "cats": [
                    12
                ],
                "env": "^Vue$",
                "script": [
                    "vue(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "/([\\d.]+)/vue(\\.min)?\\.js\\;version:\\1",
                    "vue.*\\.js;\\confidence:20"
                ],
                "website": "vuejs.org"
            },
            "W3 Total Cache": {
                "cats": [
                    23
                ],
                "headers": {
                    "X-Powered-By": "W3 Total Cache(?:/([\\d.]+))?\\;version:\\1"
                },
                "html": "<!--[^>]+W3 Total Cache",
                "implies": "WordPress",
                "website": "www.w3-edge.com/wordpress-plugins/w3-total-cache"
            },
            "W3Counter": {
                "cats": [
                    10
                ],
                "script": "w3counter\\.com/tracker\\.js",
                "website": "www.w3counter.com"
            },
            "WP Rocket": {
                "cats": [
                    23
                ],
                "headers": {
                    "X-Powered-By": "WP Rocket(?:/([\\d.]+))?\\;version:\\1"
                },
                "html": "<!--[^>]+WP Rocket",
                "implies": "WordPress",
                "website": "wp-rocket.me"
            },
            "Web Optimizer": {
                "cats": [
                    10
                ],
                "html": "<title [^>]*lang=\"wo\">",
                "website": "www.web-optimizer.us"
            },
            "Web2py": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "web2py"
                },
                "implies": [
                    "Python",
                    "jQuery"
                ],
                "meta": {
                    "generator": "^Web2py"
                },
                "script": "web2py\\.js",
                "website": "web2py.com"
            },
            "WebGUI": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "^wgSession="
                },
                "implies": "Perl",
                "meta": {
                    "generator": "^WebGUI ([\\d.]+)\\;version:\\1"
                },
                "website": "www.webgui.org"
            },
            "webpack": {
                "cats": [
                    44
                ],
                "env": "^webpackJsonp$",
                "website": "webpack.github.io"
            },
            "WebPublisher": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "WEB\\|Publisher"
                },
                "website": "scannet.dk"
            },
            "Webix": {
                "cats": [
                    12
                ],
                "env": "^webix$",
                "script": "\bwebix\\.js",
                "website": "webix.com"
            },
            "Webs": {
                "cats": [
                    1
                ],
                "headers": {
                    "Server": "Webs\\.com/?([\\d\\.]+)?\\;version:\\1"
                },
                "website": "webs.com"
            },
            "WebsPlanet": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "WebsPlanet"
                },
                "website": "websplanet.com"
            },
            "Websale": {
                "cats": [
                    6
                ],
                "url": "/websale7/",
                "website": "websale.de"
            },
            "WebsiteBaker": {
                "cats": [
                    1
                ],
                "implies": [
                    "PHP",
                    "MySQL"
                ],
                "meta": {
                    "generator": "WebsiteBaker"
                },
                "website": "websitebaker2.org/en/home.php"
            },
            "Webtrekk": {
                "cats": [
                    10
                ],
                "env": "^webtrekk",
                "website": "www.webtrekk.com"
            },
            "Webtrends": {
                "cats": [
                    10
                ],
                "env": "^(?:WTOptimize|WebTrends)",
                "html": "<img[^>]+id=\"DCSIMG\"[^>]+webtrends",
                "website": "worldwide.webtrends.com"
            },
            "Weebly": {
                "cats": [
                    1
                ],
                "script": "cdn\\d+\\.editmysite\\.com",
                "website": "www.weebly.com"
            },
            "WikkaWiki": {
                "cats": [
                    8
                ],
                "html": "Powered by <a href=\"[^>]+WikkaWiki",
                "meta": {
                    "generator": "WikkaWiki"
                },
                "website": "wikkawiki.org"
            },
            "Windows CE": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "\bWinCE\b"
                },
                "website": "microsoft.com"
            },
            "Windows Server": {
                "cats": [
                    28
                ],
                "headers": {
                    "Server": "Win32|Win64"
                },
                "website": "microsoft.com/windowsserver"
            },
            "Wink": {
                "cats": [
                    26,
                    12
                ],
                "env": "^wink$",
                "script": "(?:_base/js/base|wink).*\\.js",
                "website": "winktoolkit.org"
            },
            "Winstone Servlet Container": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Winstone Servlet (?:Container|Engine) v?([\\d.]+)?\\;version:\\1",
                    "X-Powered-By": "Winstone(?:.([\\d.]+))?\\;version:\\1"
                },
                "website": "winstone.sourceforge.net"
            },
            "Wix": {
                "cats": [
                    1
                ],
                "env": "^wix(?:Events|Data|Errors)",
                "headers": {
                    "Set-Cookie": "Domain=\\.wix\\.com",
                    "X-Wix-Dispatcher-Cache-Hit": ""
                },
                "script": "static\\.wixstatic\\.com",
                "website": "wix.com"
            },
            "Wolf CMS": {
                "cats": [
                    1
                ],
                "html": "(?:<a href=\"[^>]+wolfcms\\.org[^>]+>Wolf CMS(?:</a>)? inside|Thank you for using <a[^>]+>Wolf CMS)",
                "website": "www.wolfcms.org"
            },
            "WooCommerce": {
                "cats": [
                    6
                ],
                "env": "woocommerce",
                "html": "<!-- WooCommerce",
                "implies": [
                    "WordPress",
                    "PHP"
                ],
                "meta": {
                    "generator": "WooCommerce ([\\d.]+)\\;version:\\1"
                },
                "script": "woocommerce",
                "website": "www.woothemes.com/woocommerce"
            },
            "Woopra": {
                "cats": [
                    10
                ],
                "script": "static\\.woopra\\.com",
                "website": "www.woopra.com"
            },
            "WordPress": {
                "cats": [
                    1,
                    11
                ],
                "env": "^wp_username$",
                "html": [
                    "<link rel=[\"']stylesheet[\"'] [^>]+wp-(?:content|includes)",
                    "<link[^>]+s\\d+\\.wp\\.com"
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "WordPress( [\\d.]+)?\\;version:\\1"
                },
                "script": "/wp-includes/",
                "website": "wordpress.org"
            },
            "WordPress Super Cache": {
                "cats": [
                    23
                ],
                "html": "<!--[^>]+WP-Super-Cache",
                "implies": "WordPress",
                "website": "ocaoimh.ie/wp-super-cache/"
            },
            "Wowza Media Server": {
                "cats": [
                    38
                ],
                "html": "<title>Wowza Media Server \\d+ ((\\w+ Edition )?\\d+\\.[\\d\\.]+( build\\d+)?)?\\;version:\\1",
                "website": "www.wowza.com"
            },
            "X-Cart": {
                "cats": [
                    6
                ],
                "env": "^(?:xcart_web_dir|xliteConfig)$",
                "headers": {
                    "Set-Cookie": "xid=[a-z\\d]{32}(?:;|$)"
                },
                "html": [
                    "Powered by X-Cart(?: (\\d+))? <a[^>]+href=\"http://www\\.x-cart\\.com/\"[^>]*>\\;version:\\1",
                    "<a[^>]+href=\"[^\"]*(?:\\?|&)xcart_form_id=[a-z\\d]{32}(?:&|$)"
                ],
                "implies": "PHP",
                "meta": {
                    "generator": "X-Cart(?: (\\d+))?\\;version:\\1"
                },
                "script": "/skin/common_files/modules/Product_Options/func\\.js",
                "website": "x-cart.com"
            },
            "XAMPP": {
                "cats": [
                    22
                ],
                "html": "<title>XAMPP( Version ([\\d\\.]+))?</title>\\;version:\\1\\;confidence:90",
                "implies": [
                    "Apache",
                    "MySQL",
                    "PHP",
                    "Perl"
                ],
                "meta": {
                    "author": "Kai Oswald Seidler\\;confidence:10"
                },
                "website": "www.apachefriends.org/en/xampp.html"
            },
            "XMB": {
                "cats": [
                    2
                ],
                "html": "<!-- Powered by XMB",
                "website": "www.xmbforum.com"
            },
            "XOOPS": {
                "cats": [
                    1
                ],
                "env": "^xoops",
                "implies": "PHP",
                "meta": {
                    "generator": "XOOPS"
                },
                "website": "xoops.org"
            },
            "XRegExp": {
                "cats": [
                    12
                ],
                "env": "^XRegExp$",
                "script": [
                    "xregexp(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "/([\\d.]+)/xregexp(\\.min)?\\.js\\;version:\\1",
                    "xregexp.*\\.js"
                ],
                "website": "xregexp.com"
            },
            "Xajax": {
                "cats": [
                    12
                ],
                "script": "xajax_core.*\\.js",
                "website": "xajax-project.org"
            },
            "Xanario": {
                "cats": [
                    6
                ],
                "meta": {
                    "generator": "xanario shopsoftware"
                },
                "website": "xanario.de"
            },
            "XenForo": {
                "cats": [
                    2
                ],
                "html": "(?:jQuery\\.extend\\(true, XenForo|Forum software by XenForo&trade;|<!--XF:branding|<html[^>]+id=\"XenForo\")",
                "website": "xenforo.com"
            },
            "Xitami": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "Xitami(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "xitami.com"
            },
            "YUI": {
                "cats": [
                    12
                ],
                "env": "^YAHOO$",
                "script": "(?:/yui/|yui\\.yahooapis\\.com)",
                "website": "yuilibrary.com"
            },
            "YUI Doc": {
                "cats": [
                    4
                ],
                "html": "(?:<html[^>]* yuilibrary\\.com/rdf/[\\d.]+/yui\\.rdf|<body[^>]+class=\"yui3-skin-sam)",
                "website": "developer.yahoo.com/yui/yuidoc"
            },
            "YaBB": {
                "cats": [
                    2
                ],
                "html": "Powered by <a href=\"[^>]+yabbforum",
                "website": "www.yabbforum.com"
            },
            "Yahoo Advertising": {
                "cats": [
                    36
                ],
                "env": "^adxinserthtml$",
                "html": [
                    "<iframe[^>]+adserver\\.yahoo\\.com",
                    "<img[^>]+clicks\\.beap\\.bc\\.yahoo\\.com"
                ],
                "script": "adinterax\\.com",
                "website": "advertising.yahoo.com"
            },
            "Yahoo! Ecommerce": {
                "cats": [
                    6
                ],
                "env": "^YStore$",
                "headers": {
                    "X-XRDS-Location": "/ystore/"
                },
                "html": "<link[^>]+store\\.yahoo\\.net",
                "website": "smallbusiness.yahoo.com/ecommerce"
            },
            "Yahoo! Web Analytics": {
                "cats": [
                    10
                ],
                "env": "^YWA$",
                "script": "d\\.yimg\\.com/mi/ywa\\.js",
                "website": "web.analytics.yahoo.com"
            },
            "Yandex.Direct": {
                "cats": [
                    36
                ],
                "env": [
                    "^yandex_partner_id$",
                    "^yandex_ad_format$",
                    "^yandex_direct_"
                ],
                "html": "<yatag class=\"ya-partner__ads\">",
                "script": "https?://an\\.yandex\\.ru/",
                "website": "partner.yandex.com"
            },
            "Yandex.Metrika": {
                "cats": [
                    10
                ],
                "env": "^yandex_metrika",
                "script": "mc\\.yandex\\.ru\\/metrika\\/watch\\.js",
                "website": "metrika.yandex.com"
            },
            "Yesod": {
                "cats": [
                    18,
                    22
                ],
                "headers": {
                    "Server": "Warp/\\d+(\\.\\d+)+"
                },
                "implies": "Haskell",
                "website": "www.yesodweb.com"
            },
            "Yieldlab": {
                "cats": [
                    36
                ],
                "script": "^https?://(?:[^/]+\\.)?yieldlab\\.net/",
                "website": "yieldlab.de"
            },
            "Yii": {
                "cats": [
                    18
                ],
                "html": [
                    "Powered by <a href=\"http://www.yiiframework.com/\" rel=\"external\">Yii Framework</a>"
                ],
                "implies": [
                    "PHP"
                ],
                "website": "yiiframework.com"
            },
            "YouTube": {
                "cats": [
                    14
                ],
                "html": "<(?:param|embed|iframe)[^>]+youtube(?:-nocookie)?\\.com/(?:v|embed)",
                "website": "www.youtube.com"
            },
            "ZK": {
                "cats": [
                    18
                ],
                "html": "<!-- ZK [\\.\\d\\s]+-->",
                "implies": "Java",
                "script": "zkau/",
                "website": "zkoss.org"
            },
            "ZURB Foundation": {
                "cats": [
                    18
                ],
                "html": [
                    "<link[^>]+foundation[^>\"]+css",
                    "<div [^>]*class=\"[^\"]*(?:small|medium|large)-\\d{1,2} columns"
                ],
                "website": "foundation.zurb.com"
            },
            "Zabbix": {
                "cats": [
                    19
                ],
                "env": "^zbxCallPostScripts$",
                "html": "<body[^>]+zbxCallPostScripts",
                "meta": {
                    "Author": "ZABBIX SIA\\;confidence:70"
                },
                "url": "\\/zabbix\\/\\;confidence:30",
                "website": "zabbix.com"
            },
            "Zanox": {
                "cats": [
                    36
                ],
                "env": "^zanox$",
                "html": "<img [^>]*src=\"[^\"]+ad\\.zanox\\.com",
                "script": "zanox\\.com/scripts/zanox\\.js$",
                "website": "zanox.com"
            },
            "Zen Cart": {
                "cats": [
                    6
                ],
                "meta": {
                    "generator": "Zen Cart"
                },
                "website": "www.zen-cart.com"
            },
            "Zend": {
                "cats": [
                    22
                ],
                "headers": {
                    "Set-Cookie": "ZENDSERVERSESSID",
                    "X-Powered-By": "Zend"
                },
                "website": "zend.com"
            },
            "Zepto": {
                "cats": [
                    12
                ],
                "env": "^Zepto$",
                "script": "zepto.*\\.js",
                "website": "zeptojs.com"
            },
            "Zeuscart": {
                "cats": [
                    6
                ],
                "html": "<form name=\"product\" method=\"post\" action=\"[^\"]+\\?do=addtocart&prodid=\\d+\"(?!<\\/form>.)+<input type=\"hidden\" name=\"addtocart\" value=\"\\d+\">",
                "implies": "PHP",
                "url": "\\?do=prodetail&action=show&prodid=\\d+",
                "website": "zeuscart.com"
            },
            "Zinnia": {
                "cats": [
                    11
                ],
                "implies": "Django",
                "meta": {
                    "generator": "Zinnia"
                },
                "website": "django-blog-zinnia.com"
            },
            "Zope": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "^Zope/"
                },
                "website": "zope.org"
            },
            "actionhero.js": {
                "cats": [
                    1,
                    18,
                    22
                ],
                "env": "^actionheroClient$",
                "headers": {
                    "X-Powered-By": "actionhero API"
                },
                "implies": "node.js",
                "script": "actionheroClient\\.js",
                "website": "www.actionherojs.com"
            },
            "amCharts": {
                "cats": [
                    25
                ],
                "env": "^AmCharts$",
                "script": "amcharts.*\\.js",
                "website": "amcharts.com"
            },
            "basket.js": {
                "cats": [
                    12
                ],
                "env": "^basket$",
                "script": "basket.*\\.js",
                "website": "addyosmani.github.io/basket.js/"
            },
            "cPanel": {
                "cats": [
                    9
                ],
                "headers": {
                    "Server": "cpsrvd/([\\d.]+)\\;version:\\1"
                },
                "html": "<!-- cPanel",
                "website": "www.cpanel.net"
            },
            "cgit": {
                "cats": [
                    19
                ],
                "html": "<[^]+id='cgit'",
                "implies": "Perl",
                "website": "git.zx2c4.com/cgit"
            },
            "comScore": {
                "cats": [
                    10
                ],
                "env": "^_?COMSCORE$",
                "html": "<iframe[^>]* (?:id=\"comscore\"|scr=[^>]+comscore)|\\.scorecardresearch\\.com/beacon\\.js|COMSCORE\\.beacon",
                "script": "\\.scorecardresearch\\.com/beacon\\.js|COMSCORE\\.beacon",
                "website": "comscore.com"
            },
            "debut": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "debut\\/?([\\d\\.]+)?\\;version:\\1"
                },
                "implies": "Brother",
                "website": "www.brother.com"
            },
            "dwhttpd": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "dwhttpd\\/?([\\d\\.a-z]+)?\\;version:\\1"
                },
                "website": "???"
            },
            "e107": {
                "cats": [
                    1
                ],
                "headers": {
                    "Set-Cookie": "e107_tz[^;]+=",
                    "X-Powered-By": "e107"
                },
                "implies": "PHP",
                "script": "[^a-z\\d]e107\\.js",
                "website": "e107.org"
            },
            "eDevice SmartStack": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "eDevice SmartStack(?: ?/?([\\d.]+))?\\;version:\\1"
                },
                "website": "edevice.com"
            },
            "eHTTP": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "\beHTTP(?: v?([\\d\\.]+))?\\;version:\\1"
                },
                "implies": "HP ProCurve",
                "website": "???"
            },
            "eSyndiCat": {
                "cats": [
                    1
                ],
                "env": "^esyndicat$",
                "headers": {
                    "X-Drectory-Script": "^eSyndiCat"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "^eSyndiCat "
                },
                "website": "esyndicat.com"
            },
            "eZ Publish": {
                "cats": [
                    1,
                    6
                ],
                "headers": {
                    "X-Powered-By": "^eZ Publish"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "eZ Publish"
                },
                "website": "ez.no"
            },
            "git": {
                "cats": [
                    47
                ],
                "meta": {
                    "generator": "\bgit/([\\d.]+\\d)\\;version:\\1"
                },
                "website": "git-scm.com"
            },
            "gitweb": {
                "cats": [
                    47
                ],
                "html": "<!-- git web interface version",
                "implies": [
                    "Perl",
                    "git"
                ],
                "meta": {
                    "generator": "gitweb(?:/([\\d.]+\\d))?\\;version:\\1"
                },
                "website": "git-scm.com"
            },
            "gunicorn": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "gunicorn(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Python"
                ],
                "website": "gunicorn.org"
            },
            "hapi.js": {
                "cats": [
                    18,
                    22
                ],
                "headers": {
                    "Set-Cookie": "Fe26\\.2\\*\\*\\;confidence:50"
                },
                "implies": "node.js",
                "website": "hapijs.com"
            },
            "iCongo": {
                "cats": [
                    6
                ],
                "implies": "Adobe ColdFusion",
                "meta": {
                    "iCongo": ""
                },
                "website": "hybris.com/icongo"
            },
            "iWeb": {
                "cats": [
                    20
                ],
                "meta": {
                    "generator": "^iWeb( [\\d.]+)?\\;version:\\1"
                },
                "website": "apple.com/ilife/iweb"
            },
            "io4 CMS": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "GO[ |]+CMS Enterprise"
                },
                "website": "notenbomer.nl/Producten/Content_management/io4_|_cms"
            },
            "jQTouch": {
                "cats": [
                    26
                ],
                "env": "^jQT$",
                "script": "jqtouch.*\\.js",
                "website": "jqtouch.com"
            },
            "jQuery": {
                "cats": [
                    12
                ],
                "env": "^jQuery$",
                "script": [
                    "jquery(?:\\-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "/([\\d.]+)/jquery(\\.min)?\\.js\\;version:\\1",
                    "jquery.*\\.js"
                ],
                "website": "jquery.com"
            },
            "jQuery Mobile": {
                "cats": [
                    26
                ],
                "implies": "jQuery",
                "script": "jquery\\.mobile(?:-([\\d.]+rc\\d))?.*\\.js(?:\\?ver=([\\d.]+))?\\;version:\\1",
                "website": "jquerymobile.com"
            },
            "jQuery Sparklines": {
                "cats": [
                    25
                ],
                "implies": "jQuery",
                "script": "jquery\\.sparkline.*\\.js",
                "website": "omnipotent.net/jquery.sparkline/"
            },
            "jQuery UI": {
                "cats": [
                    12
                ],
                "implies": "jQuery",
                "script": [
                    "jquery-ui(?:-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "([\\d.]+)/jquery-ui(\\.min)?\\.js\\;version:\\1",
                    "jquery-ui.*\\.js"
                ],
                "website": "jqueryui.com"
            },
            "jqPlot": {
                "cats": [
                    25
                ],
                "implies": "jQuery",
                "script": "jqplot.*\\.js",
                "website": "www.jqplot.com"
            },
            "libwww-perl-daemon": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "libwww-perl-daemon(?:/([\\d\\.]+))?\\;version:\\1"
                },
                "implies": "Perl",
                "website": "metacpan.org/pod/HTTP::Daemon"
            },
            "lighttpd": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "lighttpd(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "www.lighttpd.net"
            },
            "math.js": {
                "cats": [
                    12
                ],
                "env": "^mathjs$",
                "script": "math(?:\\.min)?\\.js",
                "website": "mathjs.org"
            },
            "mini_httpd": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "mini_httpd(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "acme.com/software/mini_httpd"
            },
            "mod_auth_pam": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_auth_pam(?:/([\\d\\.]+))?\\;version:\\1"
                },
                "implies": "Apache",
                "website": "pam.sourceforge.net/mod_auth_pam"
            },
            "mod_dav": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "\b(?:mod_)?DAV\b(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "Apache",
                "website": "webdav.org/mod_dav"
            },
            "mod_fastcgi": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_fastcgi(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "Apache",
                "website": "www.fastcgi.com/mod_fastcgi/docs/mod_fastcgi.html"
            },
            "mod_jk": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_jk(?:/([\\d\\.]+))?\\;version:\\1"
                },
                "implies": [
                    "Apache Tomcat",
                    "Apache"
                ],
                "website": "tomcat.apache.org/tomcat-3.3-doc/mod_jk-howto.html"
            },
            "mod_perl": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_perl(?:/([\\d\\.]+))?\\;version:\\1"
                },
                "implies": [
                    "Perl",
                    "Apache"
                ],
                "website": "perl.apache.org"
            },
            "mod_python": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_python(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Python",
                    "Apache"
                ],
                "website": "www.modpython.org"
            },
            "mod_rack": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_rack(?:/([\\d.]+))?\\;version:\\1",
                    "X-Powered-By": "mod_rack(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Ruby on Rails\\;confidence:50",
                    "Apache"
                ],
                "website": "phusionpassenger.com"
            },
            "mod_rails": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_rails(?:/([\\d.]+))?\\;version:\\1",
                    "X-Powered-By": "mod_rails(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Ruby on Rails\\;confidence:50",
                    "Apache"
                ],
                "website": "phusionpassenger.com"
            },
            "mod_ssl": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_ssl(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": "Apache",
                "website": "modssl.org"
            },
            "mod_wsgi": {
                "cats": [
                    33
                ],
                "headers": {
                    "Server": "mod_wsgi(?:/([\\d.]+))?\\;version:\\1",
                    "X-Powered-By": "mod_wsgi(?:/([\\d.]+))?\\;version:\\1"
                },
                "implies": [
                    "Python\\;confidence:50",
                    "Apache"
                ],
                "website": "code.google.com/p/modwsgi"
            },
            "node.js": {
                "cats": [
                    27
                ],
                "website": "nodejs.org"
            },
            "nopCommerce": {
                "cats": [
                    6
                ],
                "html": "(?:<!--Powered by nopCommerce|Powered by: <a[^>]+nopcommerce)",
                "website": "www.nopcommerce.com"
            },
            "openEngine": {
                "cats": [
                    1
                ],
                "meta": {
                    "openEngine": ""
                },
                "website": "openengine.de/html/pages/de/"
            },
            "osCSS": {
                "cats": [
                    6
                ],
                "html": "<body onload=\"window\\.defaultStatus='oscss templates';\"",
                "website": "www.oscss.org"
            },
            "osCommerce": {
                "cats": [
                    6
                ],
                "headers": {
                    "Set-Cookie": "osCsid="
                },
                "html": "(?:<a[^>]*(?:\\?|&)osCsid|Powered by (?:<[^>]+>)?osCommerce</a>|<[^>]+class=\"[^>]*infoBoxHeading)",
                "website": "www.oscommerce.com"
            },
            "ownCloud": {
                "cats": [
                    19
                ],
                "html": "<a href=\"https://owncloud.com\" target=\"_blank\">ownCloud Inc.</a><br/>Your Cloud, Your Data, Your Way!",
                "meta": {
                    "apple-itunes-app": "app-id=543672169"
                },
                "website": "owncloud.org"
            },
            "papaya CMS": {
                "cats": [
                    1
                ],
                "html": "<link[^>]*/papaya-themes/",
                "website": "papaya-cms.com"
            },
            "phpAlbum": {
                "cats": [
                    7
                ],
                "html": "<!--phpalbum ([.\\d\\s]+)-->\\;version:\\1",
                "implies": "PHP",
                "website": "phpalbum.net"
            },
            "phpBB": {
                "cats": [
                    2
                ],
                "env": "^(?:style_cookie_settings|phpbb_)",
                "headers": {
                    "Set-Cookie": "^phpbb"
                },
                "html": "(?:Powered by <a[^>]+phpbb|<a[^>]+phpbb[^>]+class=\\.copyright|\tphpBB style name|<[^>]+styles/(?:sub|pro)silver/theme|<img[^>]+i_icon_mini|<table class=\"forumline)",
                "implies": "PHP",
                "meta": {
                    "copyright": "phpBB Group"
                },
                "website": "phpbb.com"
            },
            "phpCMS": {
                "cats": [
                    1
                ],
                "env": "^phpcms",
                "implies": "PHP",
                "website": "phpcms.de"
            },
            "phpDocumentor": {
                "cats": [
                    4
                ],
                "html": "<!-- Generated by phpDocumentor",
                "implies": "PHP",
                "website": "www.phpdoc.org"
            },
            "phpMyAdmin": {
                "cats": [
                    3
                ],
                "env": "^pma_absolute_uri$",
                "html": "(?: \\| phpMyAdmin ([\\d.]+)<\\/title>|PMA_sendHeaderLocation\\(|<link [^>]*href=\"[^\"]*phpmyadmin\\.css\\.php)\\;version:\\1",
                "implies": [
                    "PHP",
                    "MySQL"
                ],
                "website": "www.phpmyadmin.net"
            },
            "phpPgAdmin": {
                "cats": [
                    3
                ],
                "html": "(?:<title>phpPgAdmin</title>|<span class=\"appname\">phpPgAdmin)",
                "implies": "PHP",
                "website": "phppgadmin.sourceforge.net"
            },
            "phpSQLiteCMS": {
                "cats": [
                    1
                ],
                "implies": [
                    "PHP",
                    "SQLite\\;confidence:50"
                ],
                "meta": {
                    "generator": "^phpSQLiteCMS(?: (.+))?$\\;version:\\1"
                },
                "website": "phpsqlitecms.net"
            },
            "phpwind": {
                "cats": [
                    1,
                    2
                ],
                "html": "Powered by <a href=\"[^\"]+phpwind\\.net",
                "implies": "PHP",
                "meta": {
                    "generator": "^phpwind"
                },
                "website": "www.phpwind.net"
            },
            "prettyPhoto": {
                "cats": [
                    7,
                    12
                ],
                "env": "pp_(?:alreadyInitialized|descriptions|images|titles)",
                "html": "(?:<link [^>]*href=\"[^\"]*prettyPhoto(?:\\.min)?\\.css|<a [^>]*rel=\"prettyPhoto)",
                "implies": "jQuery",
                "script": "jquery\\.prettyPhoto\\.js",
                "website": "no-margin-for-errors.com/projects/prettyphoto-jquery-lightbox-clone/"
            },
            "punBB": {
                "cats": [
                    2
                ],
                "html": "Powered by <a href=\"[^>]+punbb",
                "implies": "PHP",
                "website": "punbb.informer.com"
            },
            "reCAPTCHA": {
                "cats": [
                    16
                ],
                "env": "^Recaptcha$",
                "html": "(?:<div[^>]+id=\"recaptcha_image|<link[^>]+recaptcha|document\\.getElementById\\('recaptcha')",
                "script": "(?:api-secure\\.recaptcha\\.net|recaptcha_ajax\\.js)",
                "website": "recaptcha.net"
            },
            "sIFR": {
                "cats": [
                    17
                ],
                "script": "sifr\\.js",
                "website": "www.mikeindustries.com/blog/sifr"
            },
            "sNews": {
                "cats": [
                    1
                ],
                "meta": {
                    "generator": "sNews"
                },
                "website": "snewscms.com"
            },
            "script.aculo.us": {
                "cats": [
                    12
                ],
                "env": "^Scriptaculous$",
                "script": "(?:scriptaculous|protoaculous)\\.js",
                "website": "script.aculo.us"
            },
            "shine.js": {
                "cats": [
                    25
                ],
                "env": "^Shine$",
                "script": "shine(\\.min)?\\.js",
                "website": "bigspaceship.github.io/shine.js/"
            },
            "spin.js": {
                "cats": [
                    12,
                    25
                ],
                "env": "^Spinner$",
                "script": "spin(?:\\.min)?\\.js",
                "website": "fgnass.github.io/spin.js/"
            },
            "swift.engine": {
                "cats": [
                    1
                ],
                "headers": {
                    "X-Powered-By": "swift\\.engine"
                },
                "website": "mittec.ru/default"
            },
            "three.js": {
                "cats": [
                    25
                ],
                "env": "^THREE$",
                "script": "three(?:\\.min)?\\.js",
                "website": "threejs.org"
            },
            "thttpd": {
                "cats": [
                    22
                ],
                "headers": {
                    "Server": "\bthttpd(?:/([\\d.]+))?\\;version:\\1"
                },
                "website": "acme.com/software/thttpd"
            },
            "total.js": {
                "cats": [
                    18
                ],
                "headers": {
                    "X-Powered-By": "^total\\.js"
                },
                "implies": "node.js",
                "website": "totaljs.com"
            },
            "uCore": {
                "cats": [
                    1,
                    18
                ],
                "headers": {
                    "Set-Cookie": "ucore"
                },
                "implies": "PHP",
                "meta": {
                    "generator": "uCore PHP Framework"
                },
                "website": "ucore.io"
            },
            "vBulletin": {
                "cats": [
                    2
                ],
                "env": "^(?:vBulletin|vB_[^g])",
                "implies": "PHP",
                "meta": {
                    "generator": "vBulletin"
                },
                "website": "www.vbulletin.com"
            },
            "viennaCMS": {
                "cats": [
                    1
                ],
                "html": "powered by <a href=\"[^>]+viennacms",
                "website": "www.viennacms.nl"
            },
            "vis.js": {
                "cats": [
                    25
                ],
                "env": "^vis$",
                "html": "<link[^>]+?href=\"[^\"]+vis(?:\\.min)?\\.css",
                "script": "vis(\\.min)?\\.js",
                "website": "visjs.org"
            },
            "webEdition": {
                "cats": [
                    1
                ],
                "meta": {
                    "DC.title": "webEdition",
                    "generator": "webEdition"
                },
                "website": "webedition.de/en"
            },
            "xCharts": {
                "cats": [
                    25
                ],
                "env": "^xChart$",
                "html": "<link[^>]* href=\"[^\"]*xcharts(?:\\.min)?\\.css",
                "implies": "D3",
                "script": "xcharts\\.js",
                "website": "tenxer.github.io/xcharts/"
            },
            "xtCommerce": {
                "cats": [
                    6
                ],
                "html": "<div class=\"copyright\">[^<]+<a[^>]+>xt:Commerce",
                "meta": {
                    "generator": "xt:Commerce"
                },
                "website": "www.xt-commerce.com"
            },
            "xui": {
                "cats": [
                    26,
                    12
                ],
                "env": "^xui$",
                "script": "[^a-z]xui.*\\.js",
                "website": "xuijs.com"
            },
            "yepnope.js": {
                "cats": [
                    12
                ],
                "env": "^yepnope$",
                "script": [
                    "yepnope-(?:-|\\.)([\\d.]*\\d)[^/]*\\.js\\;version:\\1",
                    "([\\d.]+)/yepnope(\\.min)?\\.js\\;version:\\1",
                    "yepnope.*\\.js"
                ],
                "website": "yepnopejs.com"
            }
        },
        "categories": {
            "1": "cms",
            "2": "message-boards",
            "3": "database-managers",
            "4": "documentation-tools",
            "5": "widgets",
            "6": "ecommerce",
            "7": "photo-galleries",
            "8": "wikis",
            "9": "hosting-panels",
            "10": "analytics",
            "11": "blogs",
            "12": "javascript-frameworks",
            "13": "issue-trackers",
            "14": "video-players",
            "15": "comment-systems",
            "16": "captchas",
            "17": "font-scripts",
            "18": "web-frameworks",
            "19": "miscellaneous",
            "20": "editors",
            "21": "lms",
            "22": "web-servers",
            "23": "cache-tools",
            "24": "rich-text-editors",
            "25": "javascript-graphics",
            "26": "mobile-frameworks",
            "27": "programming-languages",
            "28": "operating-systems",
            "29": "search-engines",
            "30": "web-mail",
            "31": "cdn",
            "32": "marketing-automation",
            "33": "web-server-extensions",
            "34": "databases",
            "35": "maps",
            "36": "advertising-networks",
            "37": "network-devices",
            "38": "media-servers",
            "39": "webcams",
            "40": "printers",
            "41": "payment-processors",
            "42": "tag-managers",
            "43": "paywalls",
            "44": "build-ci-systems",
            "45": "control-systems",
            "46": "remote-access",
            "47": "dev-tools",
            "48": "network-storage",
            "49": "feed-readers",
            "50": "document-management-systems"
        }
    }
    declare var wappalyzer;

    export class WappalyzerReportClient extends ClientPlugin {
        constructor() {
            super("wappalyzerReport");
            this._ready = true;
        }

        public getID(): string {
            return "WAPPALYZER";
        }

        public sendClientData(): void {
            var that = this;
            that._loadNewScriptAsync("wappalyzer.js", () => {
                if (wappalyzer) {
                    var w = wappalyzer;

                    w.driver = {
                        /**
                         * Log messages to console
                         */
                        log: function (args) {
                            if (console != null) { console[args.type](args.message) };
                        },

                        /**
                         * Initialize
                         */
                        init: function () {
                            w.categories = WappalyzerAppsJSON.categories;
                            w.apps = WappalyzerAppsJSON.apps;

                            var html = '';
                            for (var i = 0; i < document.scripts.length; i++) {
                                console.log(document.scripts[i]["src"]);
                                html += "<script src='" + document.scripts[i]["src"] + "'></script>";
                            }

                            console.log(html);
                            w.analyze(document.location.hostname, document.location.href, {
                                html: html/*,
                                headers: { 'Server': 'Apache' },
                                env: ['Mootools']*/
                            });
                        },

                        /**
                         * Display apps
                         */
                        displayApps: function () {
                            var message: any = {};
                            message.detected = [];
                            // app + categories
                            var
                                app,
                                cat,
                                url = Object.keys(w.detected)[0];
                            for (app in w.detected[url]) {
                                var categories = [];
                                for (var i = 0; i < WappalyzerAppsJSON.apps[app].cats.length; i++) {
                                    categories.push(WappalyzerAppsJSON.categories[WappalyzerAppsJSON.apps[app].cats[i]]);
                                }
                                message.detected.push({
                                    app: app,
                                    categories: categories
                                });
                            }
                            console.log(message);
                            Core.Messenger.sendRealtimeMessage(that.getID(), message, RuntimeSide.Client, "message");
                        },

                        /**
                         * Go to URL
                         */
                        goToURL: function (args) {
                            window.open(args.url);
                        }
                    };

                    w.init();
                }
            });
        }

        public startClientSide(): void {
            this.sendClientData();
        }

        public refresh(): void {
            this.sendClientData();
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {

        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new WappalyzerReportClient());
} 