import { Command, flags } from '@oclif/command'
import * as puppeteer from 'puppeteer'
import * as util from 'util'
import * as fs from 'fs'
import fetch from 'node-fetch'
import { Storage } from '@google-cloud/storage'
import { webgif } from '../utils/webgif'
import CMAMinter from '../utils/cma-minter'

//TODO:test this change 
import 'dotenv/config'

const rmfile = util.promisify(fs.unlink)

const storage = new Storage()

const CMA_FE_URL = process.env.CMA_FE_URL || ''
const CMA_API_URL = process.env.CMA_API_UR ||''
const BUCKET_NAME = process.env.BUCKET_NAME || ''
const STORAGE_URL_BASE = `https://storage.googleapis.com/${BUCKET_NAME}/`

const CMA_FE_ACCESS_TOKEN = process.env.CMA_FE_ACCESS_TOKEN || ''
const CMA_FE_CANVAS_ID = process.env.CMA_FE_WORK_ID || ''


interface GeneratedPaths {
  [key:string]: string;
}

interface NFTData {
  id: string,
  name: string,
  description: string,
  gif: string,
  image: string
}

export default class Work extends Command {
  static description = 
  `
  (1) Captures current easel, saves to image and gif (webm)
  (2) Generates metadata for new work and adds to cma-api
  (3) Mint NFT
  `

  static examples = [
    `$ cma-bot work\n...
    `
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async _cleanup(generatedPaths: GeneratedPaths) {
    this.log('CMA-BOT is performing cleanup')
    await rmfile(generatedPaths.imagePreviewPath)
    if (generatedPaths.gifPreviewPath) {
      await rmfile(generatedPaths.gifPreviewPath)
    }
    this.log('CMA-BOT has completed cleanup')
  }

  /**
   * Catalogues the artwork
   * @param page 
   */
  async _catalogue(generatedPaths : GeneratedPaths) {
    this.log('CMA-BOT is performing the Cataloguing stage')
    const updatedMediaPreviewLinks = await this._uploadPreviewMedia(generatedPaths)
    const addedItem = await this._addToAPI(updatedMediaPreviewLinks)
    this.log('CMA-BOT has completed the Cataloguing stage')
    return addedItem
  } 

  /**
   * Catalogues the artwork
   * @param page 
   */
  async _uploadPreviewMedia(generatedPaths : GeneratedPaths) {
    const urlPaths: {[key:string]: string} = {}

    for (const generatedPathKey in generatedPaths) {
      const mediaPath = generatedPaths[generatedPathKey]
      await storage.bucket(BUCKET_NAME).upload(mediaPath, {
        gzip: true,
        metadata: {
          // Enable long-lived HTTP caching headers
          // Use only if the contents of the file will never change
          // (If the contents will change, use cacheControl: 'no-cache')
          cacheControl: 'public, max-age=31536000',
        },
      })
      await storage.bucket(BUCKET_NAME).file(mediaPath).makePublic()
      urlPaths[generatedPathKey] = `${STORAGE_URL_BASE}` + mediaPath
    }
      
    return urlPaths
  }

  /**
   * Adds artwork metadata to API
   * @param page 
   */
  async _addToAPI(generatedPaths : GeneratedPaths) {
    this.log('CMA-BOT is adding metadata for new artwork to API')
    const metadata = {
      name: Date.now(),
      description: Date.now(),
      image: generatedPaths.imagePreviewPath,
      gif: generatedPaths.gifPreviewPath
    }
    const response = await fetch(CMA_API_URL, {
      method: 'post',
      body: JSON.stringify(metadata),
      headers: {'Content-Type': 'application/json'}
    })

    return await response.json()
  }

  /**
   * Captures current easel, generates image and gif previews
   * @param page 
   */
  async _capture () {
    this.log('CMA-BOT is performing the Capture stage')
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const cmaUrl = `${CMA_FE_URL}?canvas=${CMA_FE_CANVAS_ID}&accessToken=${CMA_FE_ACCESS_TOKEN}`
    const imagePreviewPath = await this._generateImagePreview(page, cmaUrl)
    const gifPreviewPath = await this._generateGIFPreview(page, cmaUrl)
    
    await browser.close()
    this.log('CMA-BOT has completed the Capture stage.')
    return { imagePreviewPath, gifPreviewPath }
  }

  /**
   * Generates image preview (downsampled) of the work
   * @param page 
   */
  async _generateImagePreview (page: puppeteer.Page, cmaUrl: string) {
    //todo - change this to randomword + short
    const imagePreviewPath = Date.now()+'__cma-token.png'
    
    this.log('CMA-BOT is generating an image preview of the artwork')
    await page.goto(cmaUrl)
    await page.screenshot({path: imagePreviewPath })
    
    this.log('CMA-BOT generated image preview '+imagePreviewPath)
    return imagePreviewPath
  }

  /**
   * Generates image preview (downsampled) of the work
   * @param page 
   */
  async _generateGIFPreview (page: puppeteer.Page, cmaUrl: string) {
    this.log('CMA-BOT is generating a GIF preview of the artwork')
    const gifPreviewPath = Date.now()+'__cma-token.gif'
    await webgif({
      url: cmaUrl,
      duration: 30,
      output: gifPreviewPath,
      page: page 
    })
    this.log('CMA-BOT generated GIF preview '+gifPreviewPath)
    
    return gifPreviewPath
  }

  async _mintNFT (item: NFTData) {
    const minter = new CMAMinter()
    console.log(item)
    // const mintedToken = await minter.mint(parseInt(item.id))
    // console.log(mintedToken)
  }

  async run () {
    const { args, flags } = this.parse(Work)
    
    const generatedPaths = await this._capture()
    const originalGeneratedPaths = JSON.parse(JSON.stringify(generatedPaths))
    const addedItem = await this._catalogue(generatedPaths)
    await this._mintNFT(addedItem)
    await this._cleanup(originalGeneratedPaths)
  }
}
