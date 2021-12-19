import { ALPHA_VANTAGE_API_URL, ALPHA_VANTAGE_API_KEY } from "../settings";

export interface StockSearchResult {
	symbol: string;
	name: string;
	type: string;
	region: string;
	marketOpen: string;
	marketClose: string;
	timezone: string;
	currency: string;
	matchScore: string;
}

export interface StockSearchResponse {
	bestMatches: StockSearchResult[];
}

export interface RawStockSearchResult {
	"1. symbol": string;
	"2. name": string;
	"3. type": string;
	"4. region": string;
	"5. marketOpen": string;
	"6. marketClose": string;
	"7. timezone": string;
	"8. currency": string;
	"9. matchScore": string;
}

export interface RawStockSearchResponse {
	bestMatches: RawStockSearchResult[];
}

const stockSearchResultMap = {
	"1. symbol": "symbol",
	"2. name": "name",
	"3. type": "type",
	"4. region": "region",
	"5. marketOpen": "marketOpen",
	"6. marketClose": "marketClose",
	"7. timezone": "timezone",
	"8. currency": "currency",
	"9. matchScore": "matchScore",
};

const parseStockSearchResponse = (response: RawStockSearchResponse, map: Record<string, string>): StockSearchResponse => {
	const parsedResult: unknown = {
		bestMatches: response.bestMatches.map((result: RawStockSearchResult) => {
			return Object.entries(result).reduce((accumulator: Record<string, string>, [key, value]: [string, string])=> {
				accumulator[map[key]] = value;
				return accumulator;
			}, {});
		})
	};
	return parsedResult as StockSearchResponse;
};

export const alphaVantageRequest = (
	fn: string, 
	params: Record<string, string>, 
	parser: (response: RawStockSearchResponse, map: Record<string, string>) => StockSearchResponse
): Promise<StockSearchResponse> => {
	return new Promise((resolve, reject) => {
		const queryString = new URLSearchParams({
			...params,
			function: fn,
			apikey: ALPHA_VANTAGE_API_KEY
		}).toString();
		
		fetch(`${ALPHA_VANTAGE_API_URL}?${queryString}`)
			.then((response: Response): void => {
				if (!response.ok) {
					reject();
					return;
				}
				response.json()
					.then((response: RawStockSearchResponse): void => {
						const parsedResponse = parser(response, stockSearchResultMap);
						resolve(parsedResponse);
					})
					.catch((error): void => {
						console.error("error", error);
					});
			})
			.catch((response: Response): void => {
				reject(response);
			});
	});
};

export const stockSearch = (query: string): Promise<StockSearchResponse> => {
	return alphaVantageRequest("SYMBOL_SEARCH", { keywords: query }, parseStockSearchResponse);
};
