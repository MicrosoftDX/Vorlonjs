import fs = require("fs");
import path = require("path");

export module VORLON {
    export class BaseURLConfig {
		
		public baseURL: string;
		
		constructor() {
			var catalogdata: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");            
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);
			if (catalog.baseURL != undefined) {
				this.baseURL = catalog.baseURL;
			}
			else {
				this.baseURL = "";
			}
		}
	}
}