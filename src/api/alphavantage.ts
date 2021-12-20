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
	if (response["bestMatches"] === undefined) {
		throw new Error("Malformed response");
	}
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

export interface StockQuote {
	createdTime: number;
	open: string;
	high: string;
	low: string;
	price: string;
	changePercent: string;
}

export interface RawQuoteSearchResult {
	[key: string]: string;
	"01. symbol": string;
	"02. open": string;
	"03. high": string;
	"04. low": string;
	"05. price": string;
	"06. volume": string;
	"07. latest trading day": string;
	"08. previous close": string;
	"09. change": string;
	"09. change percent": string;
}

export interface RawQuoteSearchResponse {
	"Global Quote": RawQuoteSearchResult;
}

const quoteSearchResultMap = {
	"02. open": "open",
	"03. high": "high",
	"04. low": "low",
	"05. price": "price",
	"09. change percent": "changePercent",
};

const parseQuoteSearchResponse = (response: RawQuoteSearchResponse, map: Record<string, string>): StockQuote => {
	if (response["Global Quote"] === undefined) {
		throw new Error("Malformed response");
	}
	const parsedResult: any = Object.entries(quoteSearchResultMap).reduce((accumulator: Record<string, string>, [key, value]: [string, string]) => {
		accumulator[value] = response["Global Quote"][key];
		return accumulator;
	}, {});
	parsedResult.createdTime = Date.now();
	return parsedResult as StockQuote;
};

export const alphaVantageRequest = <RawResponseType, ParsedResponseType>(
	fn: string, 
	params: Record<string, string>, 
	parser: (response: RawResponseType, map: Record<string, string>) => ParsedResponseType
): Promise<ParsedResponseType> => {
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
					.then((response: RawResponseType): void => {
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
	return alphaVantageRequest<RawStockSearchResponse, StockSearchResponse>("SYMBOL_SEARCH", { keywords: query }, parseStockSearchResponse);
};

export const quoteSearch = (symbol: string): Promise<StockQuote> => {
	return alphaVantageRequest<RawQuoteSearchResponse, StockQuote>("GLOBAL_QUOTE", { symbol: symbol }, parseQuoteSearchResponse);
};
