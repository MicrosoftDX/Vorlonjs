module VORLON {
    export class PerformanceItem {
        public name: string;
        public type: string;
        public startTime: number;
        public duration: number;
        public redirectStart: number;
        public redirectDuration: number;
        //public appCacheStart: number;
        //public appCacheDuration: number;
        public dnsStart: number;
        public dnsDuration: number;
        public tcpStart: number;
        public tcpDuration: number;
        //public sslStart: number;
        //public sslDuration: number;
        public requestStart: number;
        public requestDuration: number;
        public responseStart: number;
        public responseDuration: number;
    }
} 