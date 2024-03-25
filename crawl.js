const { JSDOM } = require("jsdom");

async function crawlPage(baseURL, currentURL, pages) {
  console.log(`baseURL: ${baseURL}, currentURL: ${currentURL}`)
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  const normalizedCurrentURL = nomalizeURL(currentURL);
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;

  console.log(`actively crawling: ${currentURL}`);

  try {
    const resp = await fetch(currentURL);

    if (resp.status > 399) {
      console.error(
        `error in fetch with status code: ${resp.status}, on page: ${currentURL}`
      );
      return pages;
    }

    const contentType = resp.headers.get("content-type");

    if (!contentType.includes("text/html")) {
      console.error(
        `non html response, content-type: ${contentType}, on page: ${currentURL}`
      );
      return pages;
    }
    const htmlBody = await resp.text();

    const nextURLs = getURLsFromHTML(htmlBody, baseURL);

    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    console.log(`error in fetch: ${err.message}, on page: ${currentURL}`);
  }
  return pages;
}

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");
  for (const linkElement of linkElements) {
    if (linkElement.href.startsWith("/")) {
      // relative URL
      try {
        const urlObj = new URL(baseURL + linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.error(
          `error with relative url ${err.message}, url: ${linkElement.href}`
        );
      }
    } else {
      // absolute URL
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.error(
          `error with absolute url ${err.message}, url: ${linkElement.href}`
        );
      }
    }
  }
  return urls;
}

function nomalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

module.exports = {
  nomalizeURL,
  getURLsFromHTML,
  crawlPage,
};
