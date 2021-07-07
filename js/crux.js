/**
 * @url https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started
 */
const CrUXApiUtil = {
  /**
   * Query the CrUX API for metric records
   * @param {{origin?: string, url?: string, formFactor?: string,  metrics?: Array<string>}} requestBody
   * @param {string} apiKey
   * @return {{record: {key: Object, metrics: Map<string, {histogram: Array<{ start: number, end?: number, density: number}>}>}, urlNormalizationDetails: Object}}
   */
  query: async function (requestBody, apiKey) {
    const endpointUrl = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';
    const resp = await fetch(`${endpointUrl}?key=${apiKey}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error.message);
    return json;
  }
};

// Gather the data for example.com and display it
async function crux(url, apiKey) {
  const json = await CrUXApiUtil.query({origin: url}, apiKey);
  console.log('CrUX API response:', json);

  const labeledMetrics = labelMetricData(json.record.metrics);

  // Display metric results
  for (const metric of labeledMetrics) {
    const metricEl = document.createElement('section');

    const titleEl = document.createElement('h2');
    titleEl.textContent = metric.acronym;

    const [descEl, barsEl] = createDescriptionAndBars(metric.labeledBins);

    metricEl.append(titleEl, descEl, barsEl);
    document.getElementById('wrapper').append(metricEl);
  }
};

/**
 * Utility method to transform the response's metric data into an array of usable metric objects
 * Example return value:
  [
    {
      "acronym": "FCP",
      "name": "first_contentful_paint",
      "labeledBins": [{
        "label": "good",
        "percentage": 43.51,
        "start": 0,
        "end": 1000,
        "density": 0.4351
      }, // ... (other bins) ]
    }, // ... (other metrics) ]
*
* @return {{acronym: string, name: string, labelsBins: Array<{label: 'good'|'needs improvement'|'poor', percentage: number, start: number, end?: number, density: number}>}}
*/
function labelMetricData(metrics) {
  const nameToAcronymMap = {
    first_contentful_paint: 'FCP',
    largest_contentful_paint: 'LCP',
    first_input_delay: 'FID',
    cumulative_layout_shift: 'CLS',
  };

  return Object.entries(metrics).map(([metricName, metricData]) => {
    const standardBinLabels = ['good', 'needs improvement', 'poor'];
    const metricBins = metricData.histogram;

    // We assume there are 3 histogram bins and they're in order of: good => poor
    const labeledBins = metricBins.map((bin, i) => {
      // Assign a good/poor label, calculate a percentage, and add retain all existing bin properties
      return {
        label: standardBinLabels[i],
        percentage: bin.density * 100,
        ...bin,
      };
    });

    return {
      acronym: nameToAcronymMap[metricName],
      name: metricName,
      labeledBins,
    };
  });
}

// Create the three bars w/ a 3-column grid
// This consumes the output from labelMetricData, not a raw API response.
function createDescriptionAndBars(labeledBins) {
  const descEl = document.createElement('p');
  // Example: 'good: 43.63%, needs improvement: 42.10%, poor: 14.27%'
  descEl.textContent = labeledBins
    .map(bin => `${bin.label}: ${bin.percentage.toFixed(2)}%`)
    .join(', ');

  let barsEl = document.createElement('div');

  for (const bin of labeledBins) {
    const barEl = document.createElement('div');
    // Reuse the label for the styling class, changing any spaces:  `needs improvement` => `needs-improvement`
    barEl.classList.add(`box-${bin.label.replace(' ', '-')}`);
    // Add tooltip to share the size of each bin
    barEl.title = `bin start: ${bin.start}, bin end: ${bin.end}`;
    barsEl.append(barEl);
  }

  // Set the width of the bar columns based on metric bins
  // Ex: `grid-template-columns: 43.51% 42.26% 14.23%`;
  barsEl.style.gridTemplateColumns = labeledBins.map(bin => `${bin.percentage}%`).join(' ');
  barsEl.classList.add(`grid-container`);

  return [descEl, barsEl];
}
