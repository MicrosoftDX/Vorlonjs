import fs = require("fs");
import path = require("path");

var argv = require('minimist')(process.argv.slice(2));

export module VORLON {
  export class ConfigProvider {
    public static getConfigPath(): string {
        return argv.config ? path.join(process.cwd(), argv.config) : path.join(__dirname, "../config.json");
    }
  }
}
