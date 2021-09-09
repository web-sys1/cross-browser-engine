
const puppeteer = require("puppeteer-core");
const chrome = require("chrome-aws-lambda");

const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function getOptions(isDev) {
  let options;
  if (isDev) {
    options = {
      args: [],
      executablePath: exePath,
      headless: true,
    };
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    };
  }
  return options;
}

module.exports = async (req, res) => {
  const lighthouse = require('lighthouse');
  const {userAgents} = require('lighthouse/lighthouse-core/config/constants')
  const urlParam = req.query.page;
  const lang = req.query.locale;
  const output = req.query.output
  

  // pass in this parameter if you are developing locally
  // to ensure puppeteer picks up your machine installation of
  // Chrome via the configurable options
  const isDev = req.query.isDev === "true";

  try {
    const options = await getOptions(isDev);

    // launch a new headless browser with dev / prod options
    const browser = await puppeteer.launch(options);
    const sessionPort = new URL(browser.wsEndpoint()).port;
    const emulator = req.query.emulator;
    const page = await browser.newPage();
	
	var isMobile;
	
	 if (emulator === 'desktop') {
		this.isMobile = false;
		this.isDisabled = true,
		this.emulatedUserAgent = userAgents.desktop,
		this.formFactor = 'desktop'
	 } else if (emulator === 'mobile') {
		this.isMobile = true,
		this.isDisabled = false,
		this.emulatedUserAgent = userAgents.mobile,
		this.formFactor = 'mobile'
     } else { 
            res.statusCode = 403;
	    res.end(JSON.stringify({"body": "Something went wrong! Unable to proceed.", error: "You probably missed 'emulator' param, which is required to simulate device.", "code": res.statusCode}, null, 2))
	 }
	
	const lr_flags = {
	 output: output,
	 logLevel: 'info',
	 port: sessionPort,
	 emulatedUserAgent: this.emulatedUserAgent,
	 screenEmulation: {
		deviceScaleRatio: 1,
		deviceScaleFactor: 1,
                mobile: this.isMobile,
                disabled: false,
       },
        formFactor: this.formFactor,
        locale: lang,
        throttling: { 
		downloadThroughputKbps: 0,
	        rttMs: 40,
		requestLatencyMs: -10,
                throughputKbps: 10240,
		uploadThroughputKbps: 0
	   }
	};

    await page.goto(urlParam);

    const lh = await lighthouse(page.url(), lr_flags)
	
    // close the browser
    await browser.close();

    res.statusCode = 200;
	
	if (output == 'json') {
	  const indent = req.query.indentation
          res.end(JSON.stringify(lh.lhr, null, indent));
	} else if (output == 'html') {
          res.send(lh.report);
	} else if(!output) {
	   res.statusCode = 400;
	   res.end(JSON.stringify({error: "You didn't set 'output' param. Did you forget 'json' or 'html'?"}, null, 2));
	}
	
    } catch (e) {
      res.statusCode = 500;
      res.end({
        body: "Sorry, Something went wrong! Probably, the problem is with the system. Please try again!",
        errorMessage: e,
    });
  }
};
