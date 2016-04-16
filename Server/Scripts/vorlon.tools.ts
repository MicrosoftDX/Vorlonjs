export module VORLON {
    export class Tools {
        
        public static GetIconSystem(name: string) {
            if (['Windows'].indexOf(name) > -1) {
                return "windows.png"
            }
            
            if (['Windows Phone'].indexOf(name) > -1) {
                return "windows_phone.png"
            }
            
            if (['Android'].indexOf(name) > -1) {
                return "android.png"
            }
            
            if (['iOS', 'Macintosh'].indexOf(name) > -1) {
                return "apple.png"
            }
            
            if (['BlackBerry'].indexOf(name) > -1) {
                return "bb.png"
            }
            
            if (['Kindle'].indexOf(name) > -1) {
                return "kindle.png"
            }
            
            if (['Linux'].indexOf(name) > -1) {
                return "linux.png"
            }
            
            if (['OpenBSD'].indexOf(name) > -1) {
                return "openbsd.png"
            }
            
            if (['Firefox OS'].indexOf(name) > -1) {
                return "firefox.png"
            }
            
            if (['Node.js'].indexOf(name) > -1) {
                return "nodejs.png"
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
