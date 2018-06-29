'use strict'

/* global expect */
/* eslint-env mocha */

import ms from 'milliseconds'

import {createAndPreparePad, leanup} from './utils'

let pages = []
let pageCount = process.env.PARALLEL_PAGES ? parseInt(process.env.PARALLEL_PAGES, 10) : 2

async function allPages(fnc) { // this is parallel
  await Promise.all(pages.map(fnc))
}

describe('load tests', () => {
  beforeAll(async () => {
    for (var i = 0; i < pageCount; i++) {
      console.log('creating page %s/%s', i + 1, pageCount)
      pages.push(await createAndPreparePad())
    }
  }, ms.minutes(pageCount * 2))

  it('several people are typing', async () => {
    const txt = 'abc'
    const selector = '.CodeMirror-code'

    await allPages(async (page) => {
      page.type(selector, txt)
    })

    await new Promise((resolve) => setTimeout(resolve, ms.seconds(20)))

    await allPages(async (page) => {
      const value = await page.evaluate(() => {
        return $('.CodeMirror-line').text()
      })

      expect(value).toEqual(txt.repeat(pageCount))
    })
  }, ms.minutes(1))

  afterAll(() => cleanup())
})