// retrieve links from the sitemap object
function extract(sitemapObject) {
	const urls = sitemapObject.getElementsByTagName('url'), links = [];

	Object.keys(urls).forEach(function(key, i) {
		links.push(urls[key].getElementsByTagName('loc')[0].textContent);
	});

	return links;
};

// parse a text string into an XML DOM object
function parseXMLSitemap(sitemapContent) {
	const parser = new DOMParser(), xmlDoc = parser.parseFromString(sitemapContent, 'text/xml');
	return xmlDoc;
};

// get sitemap content and parse it to Document Object Model
function parse(sitemapFile) {
	const xhttp = new XMLHttpRequest();
	let pages = [];

	xhttp.onreadystatechange = function() {
		if ((this.readyState === 4) && (this.status === 200)) {
			const sitemapContent = this.responseText, sitemapObject = parseXMLSitemap(sitemapContent);
			pages = [...extract(sitemapObject)];
		}
	};

	xhttp.open('GET', sitemapFile, false);
	xhttp.send();
	return pages;
};
