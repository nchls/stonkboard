import { 
	earningsReportMap, 
	isRateLimitingResponse, 
	parseEarningsSearchResponse, 
	parseQuoteSearchResponse, 
	parseStockSearchResponse, 
	quoteSearchResultMap, 
	RawEarningsSearchResponse, 
	RawQuoteSearchResponse, 
	RawStockSearchResponse, 
	stockSearchResultMap 
} from "./alphavantage";
import { RateLimitError } from "./interfaces";

const mockRawStockSearchResponse: RawStockSearchResponse = {
    "bestMatches": [
        {
            "1. symbol": "LMAO",
            "2. name": "LMF Acquisition Opportunities Inc - Class A",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "1.0000"
        },
        {
            "1. symbol": "LMAOU",
            "2. name": "LMF Acquisition Opportunities Inc - Units (1 Ord Class A & 1 War)",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "0.8889"
        },
        {
            "1. symbol": "LMAOW",
            "2. name": "LMF Acquisition Opportunities Inc - Warrants (26/01/2026)",
            "3. type": "Equity",
            "4. region": "United States",
            "5. marketOpen": "09:30",
            "6. marketClose": "16:00",
            "7. timezone": "UTC-04",
            "8. currency": "USD",
            "9. matchScore": "0.8889"
        },
    ]
};

const mockRawQuoteSearchResponse: RawQuoteSearchResponse = {
    "Global Quote": {
        "01. symbol": "LMAO",
        "02. open": "10.0500",
        "03. high": "10.0500",
        "04. low": "10.0500",
        "05. price": "10.0500",
        "06. volume": "80",
        "07. latest trading day": "2021-12-22",
        "08. previous close": "10.0500",
        "09. change": "0.0000",
        "10. change percent": "0.0000%",
    }
};

const mockRawEarningsSearchResponse: RawEarningsSearchResponse = {
    "symbol": "LMAO",
    "annualEarnings": [
        {
            "fiscalDateEnding": "2021-09-30",
            "reportedEPS": "-0.1158"
        },
        {
            "fiscalDateEnding": "2020-12-31",
            "reportedEPS": "0.1768"
        }
    ],
    "quarterlyEarnings": [
        {
            "fiscalDateEnding": "2021-09-30",
            "reportedDate": "2021-09-30",
            "reportedEPS": "0.0181",
            "estimatedEPS": "None",
            "surprise": "None",
            "surprisePercentage": "None"
        },
        {
            "fiscalDateEnding": "2021-06-30",
            "reportedDate": "2021-09-30",
            "reportedEPS": "0.0181",
            "estimatedEPS": "None",
            "surprise": "None",
            "surprisePercentage": "None"
        },
    ]
};

const mockRawEarningsSearchResponseWithNoEarnings: RawEarningsSearchResponse = {
    "symbol": "LMAO"
};

const mockRateLimitedResponse = {
	Note: "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency. Thank you!"
};

describe('parseStockSearchResponse', () => {
	it('correctly formats a raw stock search response', () => {
		const result = parseStockSearchResponse(mockRawStockSearchResponse, stockSearchResultMap);
		expect(result).toEqual({
			bestMatches: [
				{
					symbol: 'LMAO',
					name: 'LMF Acquisition Opportunities Inc - Class A',
					type: 'Equity',
					region: 'United States',
					marketOpen: '09:30',
					marketClose: '16:00',
					timezone: 'UTC-04',
					currency: 'USD',
					matchScore: '1.0000'
				},
				{
					symbol: 'LMAOU',
					name: 'LMF Acquisition Opportunities Inc - Units (1 Ord Class A & 1 War)',
					type: 'Equity',
					region: 'United States',
					marketOpen: '09:30',
					marketClose: '16:00',
					timezone: 'UTC-04',
					currency: 'USD',
					matchScore: '0.8889'
				},
				{
					symbol: 'LMAOW',
					name: 'LMF Acquisition Opportunities Inc - Warrants (26/01/2026)',
					type: 'Equity',
					region: 'United States',
					marketOpen: '09:30',
					marketClose: '16:00',
					timezone: 'UTC-04',
					currency: 'USD',
					matchScore: '0.8889'
				}
			]
		});
	});
	it('throws a RateLimitError on a rate limited response', () => {
		expect(() => {
			parseStockSearchResponse(mockRateLimitedResponse as RawStockSearchResponse, stockSearchResultMap)
		}).toThrow(RateLimitError);
	});
});

describe('parseQuoteSearchResponse', () => {
	it('correctly formats a raw quote search response', () => {
		const result = parseQuoteSearchResponse(mockRawQuoteSearchResponse, quoteSearchResultMap);
		expect(result).toEqual({
			open: '10.0500',
			high: '10.0500',
			low: '10.0500',
			price: '10.0500',
			changePercent: '0.0000%'
		});
	});
	it('throws a RateLimitError on a rate limited response', () => {
		expect(() => {
			parseQuoteSearchResponse(mockRateLimitedResponse as RawQuoteSearchResponse, quoteSearchResultMap)
		}).toThrow(RateLimitError);
	});
});

describe('parseEarningsSearchResponse', () => {
	it('correctly formats a raw earnings search response', () => {
		const result = parseEarningsSearchResponse(mockRawEarningsSearchResponse, earningsReportMap);
		expect(result).toEqual({
			reports: [
				{ fiscalDateEnding: '2021-09-30', reportedEPS: '0.0181' },
				{ fiscalDateEnding: '2021-06-30', reportedEPS: '0.0181' }
			]
		});
	});
	it('returns an empty list of reports when no earnings are reported', () => {
		const result = parseEarningsSearchResponse(mockRawEarningsSearchResponseWithNoEarnings, earningsReportMap);
		expect(result).toEqual({
			reports: []
		});
	});
	it('throws a RateLimitError on a rate limited response', () => {
		expect(() => {
			parseEarningsSearchResponse(mockRateLimitedResponse as RawEarningsSearchResponse, earningsReportMap)
		}).toThrow(RateLimitError);
	});
});

describe('isRateLimitingResponse', () => {
	it('returns true on a rate-limited response', () => {
		const result = isRateLimitingResponse(mockRateLimitedResponse as RawStockSearchResponse);
		expect(result).toBe(true);
	});
	it('returns false on a normal response', () => {
		const result = isRateLimitingResponse(mockRawStockSearchResponse);
		expect(result).toBe(false);
	});
});
