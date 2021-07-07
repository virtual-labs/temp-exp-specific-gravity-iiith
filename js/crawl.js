async function crawl(urlList)
{
	const pages = [];
	const promises = urlList.map(async function(url, idx) {
		await axios.get(url)
			.then(function(res) {
				const parser = new DOMParser(), doc = parser.parseFromString(res.data, "text/html"), currUrlPages = [], urls = doc.links; 

				Object.keys(urls).forEach((item) => {
					let href = urls[item].attributes.href.nodeValue;

					if(href)
					{
						href = href.trim();

						if(href.startsWith(url))
						{
							currUrlPages.push(href);
						}

						else if(!href.startsWith('http'))
						{
							currUrlPages.push(url + href);
						}
					}
				});

				pages.push(currUrlPages);
			})
			.catch(function(err) {
				console.log(err);
			});
	});

	await Promise.all(promises);
	return pages;
}
