'use strict';

document.addEventListener('DOMContentLoaded', async function() {

	//const pages = await crawl(["https://virtual-labs.github.io/exp-specific-gravity-iiith/"]), apiKey = 'AIzaSyAVkdhwABn964MsgQmYvLF7MQsASFNSEQ8';
	//await crux("https://virtual-labs.github.io/exp-specific-gravity-iiith/", 'AIzaSyAVkdhwABn964MsgQmYvLF7MQsASFNSEQ8');

	function splitToChunks(array, parts) {
		let result = [];
		for (let i = parts; i > 0; i--) {
			result.push(array.splice(0, Math.ceil(array.length / i)));
		}
		return result;
	};

	const pages = parse('sitemap.xml'), apiKey = 'AIzaSyAVkdhwABn964MsgQmYvLF7MQsASFNSEQ8';

	const subArrs = splitToChunks(pages, 5), reports = {};
	const promises = subArrs.map(async (pages, i) => {
		for(let i = 0; i < pages.length; i += 1)
		{
			reports[pages[i]] = await reportGen(pages[i], apiKey);
		}
	});

	await Promise.all(promises);

	const main = document.getElementById('main');
	let active = document.getElementsByClassName('is-active');
	const activeProms = Object.keys(active).map(async (key, i) => {
		main.innerHTML = '';
		const data = await reportGen(active[key].id, apiKey);
		populate(main, active[key].id, {...reports[active[key].id]});
	});

	async function changeActive(elem) {
		Object.keys(active).forEach((key, i) => {
			active[key].classList.remove('is-active');
		});

		elem.classList.add('is-active');
		active = { 0: elem };

		main.innerHTML = '';
		populate(main, elem.id, reports[elem.id]);
	};

	const tabs = document.getElementById('tabs').children[0].children;
	Object.keys(tabs).forEach((tab, ix) => {
		tabs[tab].addEventListener("click", (event) => changeActive(event.currentTarget));
	});

	Promise.all(activeProms);
});
