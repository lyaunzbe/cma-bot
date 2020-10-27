const fs = require('fs');
const GIFEncoder = require('gifencoder');
const path = require('path');
const pngFileStream = require('png-file-stream');
import * as puppeteer from 'puppeteer'
const tempdir = require('tempdir');

interface WebGifParams {
  url: string,
  duration: number,
  output: string,
  page: puppeteer.Page
}

export const webgif = async (argv: WebGifParams) => {
  const page = argv.page
  const workdir = await tempdir();

  console.log(`Navigating to URL: ${argv.url}`);
  await page.goto(argv.url);

  console.log('Taking screenshots: .');
  const screenshotPromises = [];
  for (let i = 1; i <= argv.duration; ++i) {
    const filename = `${workdir}/T${new Date().getTime()}.png`;
    console.log('.');
    screenshotPromises.push(page.screenshot({ path: filename, }));
    await delay(1000);
  }

  await delay(1000);
  await Promise.all(screenshotPromises);
  console.log(`\nEncoding GIF: ${argv.output}`);
  const encoder = new GIFEncoder(800, 600);
  await pngFileStream(`${workdir}/T*png`)
    .pipe(encoder.createWriteStream({ repeat: 0, delay: 200, quality: 100 }))
    .pipe(fs.createWriteStream(`${argv.output}`));
  await page.close();

};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}