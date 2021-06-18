
const CrawlZalo = require('./libs/CrawlZalo');

const run = async () => {
    try {
        var crawlZalo = new CrawlZalo();
        await crawlZalo.openBrowser();

        // await bypartshop.crawl();

        await crawlZalo.crawlZalo()

        // await bypartshop.closeBrowser();
    } catch (error) {
        console.log(error);
    }
};

run();

