'use strict';

// Import chromedriver
require('chromedriver');

// Import Selenium Webdriver
const { Builder, Capabilities, By } = require('selenium-webdriver');

// Import Applitools SDK and relevant methods
const { Eyes, VisualGridRunner, Target, ConsoleLogHandler, Configuration, BrowserType, DeviceName, ScreenOrientation, BatchInfo, Region } = require('@applitools/eyes-selenium'); // should be replaced to '@applitools/eyes-selenium'

function initializeEyes(runner) {
  // Create Eyes object with the runner, meaning it'll be a Visual Grid eyes.
  const eyes = new Eyes(runner);
  // Set logger
  eyes.setLogHandler(new ConsoleLogHandler(false));


  // Create Configuration
  const configuration = new Configuration();

  // Set API key
  configuration.setApiKey(process.env.APPLITOOLS_API_KEY);

  // If dedicated or on-prem cloud, uncomment and enter the cloud url
  configuration.setServerUrl(process.env.APPLITOOLS_URL);

  // Set a proxy if required
  // configuration.setProxy('http://localhost:8888');

  // Set the AUT name
  configuration.setAppName('Eyes Examples');

  // Set a test name
  configuration.setTestName('Ignored regions are not respected inside of target regions.');

  // Set a batch name so all the different browser and mobile combinations are part of the same batch
  configuration.setBatch(new BatchInfo("creditcards"));

  // Add Chrome browsers with different Viewports
  configuration.addBrowser(1200, 800, BrowserType.CHROME);

  // Set the configuration object to eyes
  eyes.setConfiguration(configuration);
  return eyes;
}

async function runTest(url, runner) {
  //Initialize Eyes with Visual Grid Runner
  const eyes = initializeEyes(runner);

  // Create a new Webdriver
  const webDriver = new Builder()
      .withCapabilities(Capabilities.chrome())
      // .setChromeOptions(new ChromeOptions().headless())
      .build();

  try {
    // Navigate to the URL we want to test
    await webDriver.get(url);

    // Call Open on eyes to initialize a test session
    await eyes.open(webDriver);

    // Check the page
    const article =  new Region(By.css("article"));
    const pubDt = new Region(By.css(".entry-updated-date"));

    // ***** All of these checks return the following... Error Error: IllegalType: left is not a number *****
    // await eyes.check("Targeting article", Target.region(article));
    // await eyes.check("Targeting pubDt to ignore", Target.window().ignore(By.css(".entry-updated-date")));
    await eyes.check("Targeting pubDt inside of article", Target.region(article).ignore(By.css(".entry-updated-date")));


    // Close eyes asynchronously
    await eyes.closeAsync();
  } catch (e) {
    console.log('Error', e); // eslint-disable-line
  } finally {
    // Close the browser
    await webDriver.quit();
  }
}

(async () => {
  // Create a runner with concurrency of 10
  const runner = new VisualGridRunner(10);

  try {

    // Sometimes you will see differences because not all the images are showing up.
    // The images are clearly visible after webDriver.get(url)
    const urlsToTest = [
      'https://www.creditcards.com/reviews/alaska-airlines-visa-business-review/',
    ];

    // Run test for each link
    for (const url of urlsToTest) {
      await runTest(url, runner);
    }

    // Get all results at once
    const results = await runner.getAllTestResults(false);
    // Print results
    console.log(results); // eslint-disable-line
  } catch (e) {
    // if results failed, it goes here
    console.log('Error', e); // eslint-disable-line
  }
})();
