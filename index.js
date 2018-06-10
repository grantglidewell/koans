const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const getLinks = async url => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const allLinks = await page.evaluate(sel => {
    const links = Array.from(document.querySelectorAll(sel))
    return links.map(e => e.href)
  }, 'a')

  await browser.close()
  return allLinks
}

const scrapeKoan = async (url) => {
  const title = url.match(/([0-9])\w+/g)[0]
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const koan = await page.evaluate(sel => {
    const items = Array.from(document.querySelectorAll(sel))
    return items.map(a => a.innerText)[0]
  }, 'td')

  await browser.close()
  console.log(`writing ${title}`)
  return await fs.writeFileSync(path.resolve('koans', `${title}.txt`), koan)
}

getLinks('http://www.ashidakim.com/zenkoans/')
  .then(data => {
    let allLinks = Array.from(Object.values(data))
    let zenLinks = allLinks.filter(
      link =>
        link.includes('zenkoans') && !link.includes('javascript:helpPopup')
    )
    // run links through a print koan to file function
    return zenLinks
  })
  .then(links => {
    async function processArraySequentially(arr) {
      for (const item of arr) {
        await scrapeKoan(item)
      }
    }
    processArraySequentially(links)
  }).catch(console.log)
