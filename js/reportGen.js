function setUpQuery(link, apiKey, strategy) {
	const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
	const parameters = {
		url: encodeURIComponent(link),
		key: apiKey,
		category: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
		strategy: strategy
	};

	let query = `${api}?`;
	Object.keys(parameters).forEach(function(key, i) {
		if(Array.isArray(parameters[key]))
		{
			parameters[key].forEach(function(elem, idx) {
				query += `${key}=${elem}&`;
			});
		}

		else
		{
			query += `${key}=${parameters[key]}&`;
		}
	});

	query = query.slice(0, -1);
	return query;
}

function detailedLink(url, strategy) {
	return 'https://googlechrome.github.io/lighthouse/viewer/?psiurl=' + url + '&strategy=' + strategy;
}

async function reportGen(link, apiKey) {
	const strategy = ['mobile', 'desktop'], pageData = {};

	const proms = strategy.map(async (val, ind) => {
		const url = setUpQuery(link, apiKey, val);

		await axios.get(url)
			.then(response => {
				const json = response.data;

				//const cruxMetrics = {
				//"First Contentful Paint": json.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
				//"First Input Delay": json.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
				//};

				const lighthouse = json.lighthouseResult;
				const metrics = {
					'First Contentful Paint': lighthouse.audits['first-contentful-paint'].displayValue,
					'Speed Index': lighthouse.audits['speed-index'].displayValue,
					'Time To Interactive': lighthouse.audits['interactive'].displayValue,
					'Total Blocking Time': lighthouse.audits['total-blocking-time'].displayValue,
					'Largest Contentful Paint': lighthouse.audits['largest-contentful-paint'].displayValue,
					'Cumulative Layout Shift': lighthouse.audits['cumulative-layout-shift'].displayValue,
				};

				metrics['Detailed Report'] = detailedLink(link, val);
				metrics['Scores'] = {};
				Object.keys(lighthouse.categories).forEach(function(category, index) {
					metrics['Scores'][category] = lighthouse.categories[category].score * 100;
				});

				pageData[val] = metrics;
			})
			.catch(error => {
				console.log(link, error);
			});
	});

	await Promise.all(proms);
	return {...pageData};
};
