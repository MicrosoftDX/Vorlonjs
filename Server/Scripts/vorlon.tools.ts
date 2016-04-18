export module VORLON {
    export class Tools {
        
        public static GetIconSystem(name: string) {

            var os = [
                {name: ['Windows'], icon: 'windows.png'},
                {name: ['iOS', 'Macintosh'], icon: 'apple.png'},
                {name: ['Windows Phone'], icon: 'windows_phone.png'},
                {name: ['Firefox OS'], icon: 'firefox.png'},
                {name: ['Kindle'], icon: 'kindle.png'},
                {name: ['Android'], icon: 'android.png'},
                {name: ['BlackBerry'], icon: 'bb.png'},
                {name: ['Linux'], icon: 'linux.png'},
                {name: ['Linux'], icon: 'nodejs.png'},
                {name: ['OpenBSD'], icon: 'openbsd.png'},
                {name: ['Node.js'], icon: 'nodejs.png'},
            ];
            
            for (var i = 0, len = os.length; i < len; i++) {
                if(os[i].name.indexOf(name) > -1) {
                    return os[i].icon;
                }
            }
            
            return 'unknown.png';
        }
        
        public static GetOperatingSystem(ua: string) {
            var currentLowerUA = ua.toLowerCase();
            
             // Windows Phone
            if (currentLowerUA.indexOf("windows phone") >= 0) {
                return "Windows Phone";
            }
    
            // Windows
            if (currentLowerUA.indexOf("windows") >= 0) {
                return "Windows";
            }
    
            // Android
            if (currentLowerUA.indexOf("android") >= 0) {
                return "Android";
            }
    
            // iOS
            if (currentLowerUA.indexOf("apple-i") >= 0) {
                return "iOS";
            }
    
            if (currentLowerUA.indexOf("iphone") >= 0) {
                return "iOS";
            }
    
            if (currentLowerUA.indexOf("ipad") >= 0) {
                return "iOS";
            }
    
            // BlackBerry
            if (currentLowerUA.indexOf("blackberry") >= 0) {
                return "BlackBerry";
            }
    
            // BlackBerry
            if (currentLowerUA.indexOf("(bb") >= 0) {
                return "BlackBerry";
            }
    
            // Kindle
            if (currentLowerUA.indexOf("kindle") >= 0) {
                return "Kindle";
            }
    
            // Macintosh
            if (currentLowerUA.indexOf("macintosh") >= 0) {
                return "Macintosh";
            }
    
            // Linux
            if (currentLowerUA.indexOf("linux") >= 0) {
                return "Linux";
            }
    
            // OpenBSD
            if (currentLowerUA.indexOf("openbsd") >= 0) {
                return "OpenBSD";
            }
    
            // Firefox OS
            if (currentLowerUA.indexOf("firefox") >= 0) {
                return "Firefox OS"; // Web is the plaform
            }
            
            // Node.js
            if (currentLowerUA.indexOf("node.js") >= 0) {
                return "Node.js"; 
            }
    
            return "Unknown operating system";
        }
    }
}
