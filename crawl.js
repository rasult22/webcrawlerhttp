const { JSDOM } = require('jsdom')
function getURLsFromHTML (htmlBody, baseURL) {
  const urls = []
  const dom = new JSDOM(htmlBody)
  const linkElements = dom.window.document.querySelectorAll('a')
  for (const linkElement of linkElements) {
    if (linkElement.href.startsWith('/')) {
      // relative URL
      try {
        const urlObj = new URL(baseURL + linkElement.href)
        urls.push(urlObj.href)
      } catch (err) {
        console.error(`error with relative url ${err.message}`)
      }
    } else {
      // absolute URL
      try {
        const urlObj = new URL(linkElement.href)
        urls.push(urlObj.href)
      } catch (err) {
        console.error(`error with absolute url ${err.message}`)
      }
    }
  }
  return urls
}

function nomalizeURL(urlString) {
  const urlObj = new URL(urlString)
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`
  if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
    return hostPath.slice(0, -1)
  }
  return hostPath
}

module.exports = {
  nomalizeURL,
  getURLsFromHTML
}