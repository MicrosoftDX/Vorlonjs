import express = require("express");
import http = require("http");

export module VORLON {
    export interface IWebServerComponent {
        addRoutes: (app: express.Express, passport: any) => void;
        start: (httpServer: http.Server) => void;
    }
}