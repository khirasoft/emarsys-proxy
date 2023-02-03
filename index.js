const express = require("express");
const crypto = require("crypto-js");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Emarsys authentification
  const setRequest = (proxyReq, req, res) => {
    const nonce = crypto.lib.WordArray.random(16).toString(crypto.enc.Hex);
    const timestamp = (new Date()).toISOString();
    const APIsecret = "35XOacZhu1XKbtWixMs1";
    const APUuser = "sap_cx_marketing_pm008";
    //z.console.log(bundle.authData.apiSecret);
    const hash = crypto.SHA1(nonce + timestamp + APIsecret);
    const passwordDigest = crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(hash.toString(crypto.enc.Hex)));
    const wsse = `UsernameToken Username="${APUuser}", PasswordDigest="${passwordDigest}", Nonce="${nonce}", Created="${timestamp}"`;
    proxyReq.setHeader('x-wsse', wsse)
    proxyReq.setHeader('Content-type', 'application/json; charset=UTF-8')   
  }

const setResponse = (proxyReq, req, res) => {
    //res.header("Access-Control-Allow-Origin", "https://websha.de"); //https://unbouncepages.com
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT");
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }
}

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
const API_SERVICE_BASE = "https://api.emarsys.net/api/v2";

// Proxy endpoints

// Generic endpoint - probably too much 😉
app.use(
	"/ems",
	createProxyMiddleware({
        target: `${API_SERVICE_BASE}`,
		changeOrigin: true,
        logLevel: 'debug',
		pathRewrite: {"^/ems": "",},
        onProxyReq(proxyReq, req, res) {setRequest(proxyReq, req, res)},
        onProxyRes(proxyReq, req, res) {setResponse(proxyReq, req, res)}
	})
);

// Get Contact Data
app.use(
	"/emsContactData",
	createProxyMiddleware({
        target: `${API_SERVICE_BASE}/contact/getdata`,
		changeOrigin: true,
        logLevel: 'debug',
		pathRewrite: {"^/emsContactData.*": "",},
        onProxyReq(proxyReq, req, res) {setRequest(proxyReq, req, res)},
        onProxyRes(proxyReq, req, res) {setResponse(proxyReq, req, res)}
	})
);

// Get Contact Fields
app.use(
	"/emsContactFields",
	createProxyMiddleware({
        target: `${API_SERVICE_BASE}/field`,
		changeOrigin: true,
        logLevel: 'debug',
		pathRewrite: {"^/emsContactFields": "",},
        onProxyReq(proxyReq, req, res) {setRequest(proxyReq, req, res)},
        onProxyRes(proxyReq, req, res) {setResponse(proxyReq, req, res)}
	})
);

// Starting our Proxy server
app.listen(PORT, HOST, () => {
	console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
