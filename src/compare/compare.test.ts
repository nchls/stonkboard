import { rest } from "msw";
import { setupServer } from "msw/node";
import { EarningsReport } from "../api/interfaces";
import { ALPHA_VANTAGE_API_URL } from "../settings";
import { formatChartDate, getEarningsData } from "./compare";


const mockEarningsReports: EarningsReport[] = [
	{ fiscalDateEnding: '2021-09-30', reportedEPS: '0.0181' },
	{ fiscalDateEnding: '2021-06-30', reportedEPS: '0.1435' }
];

const mockTimestamps = {
	1621051200: "May 2021",
	"-1083614400": "Aug 1935",
	2368414800: "Jan 2045",
	946616400: "Dec 1999",
};

describe('getEarningsData', () => {
	it('correctly parses an array of earnings reports', () => {
		const result = getEarningsData(mockEarningsReports);
		expect(result).toEqual([ 
			{ ts: 1625025600, EPS: 0.1435 }, 
			{ ts: 1632974400, EPS: 0.0181 } 
		]);
	});
});

describe('formatChartDate', () => {
	it('correctly formats a timestamp into a date for display on the chart', () => {
		Object.entries(mockTimestamps).forEach(([ts, dt]: [string, string]) => {
			const result = formatChartDate(parseInt(ts, 10));
			expect(result).toBe(dt);
		});
	});
});

describe('compare components', () => {

});
