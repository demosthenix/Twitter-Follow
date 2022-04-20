const puppeteer = require('puppeteer');
const username = 'gilimarointl';
const fs = require('fs');

const start = 250;
const count = 200;

console.log("Collecting profile Ids")
var profileArr = [];
fs.readFile('followProfiles.txt', (err, data) => {
    if(err) throw err;

    profileArr.push(...data.toString().replace(/\r\n/g,'\n').split('\n').reverse());
    //console.log(profileArr);
});

//console.log(profileArr);

let browser = null;
let page = null;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

follow(profileArr);

async function follow(profiles) {
  browser = await puppeteer.launch({
    headless: false
  });

  page = await browser.newPage();

  page.setViewport({
    width: 1280,
    height: 800,
    isMobile: false
  });

  await page.goto('https://twitter.com/login', {
    waitUntil: 'networkidle2'
  });

  await page.type('input[name="text"]', username, {delay: 25});
  
  let nextBtn = await page.$x('//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[1]/div/div/div[6]/div');
  await nextBtn[0].click();
  
  await page.waitForTimeout(10000);

  //await page.type('input[aria-label="Search query"]', "TheIntlMagz", {delay: 25})
  console.log("Starting the systematic following process...")
  for(let i = start; i < start + count; i++) {
    let userName = profiles[i];
    try {
      await page.goto('https://twitter.com/'+userName);
      await page.waitForTimeout(2000);

      await page.reload();
      await page.waitForSelector('div[aria-label="Follow @'+userName+'"]', {
        timeout: 5000
      });

      await page.click('div[aria-label="Follow @'+userName+'"]');
      process.stdout.write("\r\x1b[K")
      process.stdout.write("followed "+(i+1)+" of "+(start+count));
      await page.waitForTimeout(150000)
    } catch {
      console.log("\nUnable to follow "+userName);
    }
    //await page.waitForTimeout(150000)
    
  }
}
