import fs = require("fs");
import path = require("path");
import config = require("./vorlon.configprovider");

export module VORLON {
    export class BaseURLConfig {

		public baseURL: string;
		public baseProxyURL : string;

		constructor() {
			var catalogdata: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);
			if (catalog.baseURL != undefined) {
				this.baseURL = process.env.BASE_URL || catalog.baseURL;
			}
			else {
				this.baseURL = "";
			}

			if (catalog.baseProxyURL != undefined) {
				this.baseProxyURL = process.env.BASE_PROXY_URL || catalog.baseProxyURL;
			}
			else {
				this.baseProxyURL = "";
			}
		}
	}
}
