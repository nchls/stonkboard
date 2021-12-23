import { ALPHA_VANTAGE_API_URL, ALPHA_VANTAGE_API_KEY } from "../settings";
import { EarningsReport, EarningsResponse, RateLimitError, StockQuote, StockSearchResponse } from "./interfaces";

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
	"Note"?: string;
	"bestMatches": RawStockSearchResult[];
}

export const stockSearchResultMap = {
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

export const parseStockSearchResponse = (response: RawStockSearchResponse, map: Record<string, string>): StockSearchResponse => {
	if (isRateLimitingResponse(response)) {
		throw new RateLimitError();
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
	"10. change percent": string;
}

export interface RawQuoteSearchResponse {
	"Note"?: string;
	"Global Quote": RawQuoteSearchResult;
}

export const quoteSearchResultMap = {
	"02. open": "open",
	"03. high": "high",
	"04. low": "low",
	"05. price": "price",
	"10. change percent": "changePercent",
};

export const parseQuoteSearchResponse = (response: RawQuoteSearchResponse, map: Record<string, string>): StockQuote => {
	if (isRateLimitingResponse(response)) {
		throw new RateLimitError();
	}
	const parsedResult: any = Object.entries(quoteSearchResultMap).reduce((accumulator: Record<string, string>, [key, value]: [string, string]) => {
		accumulator[value] = response["Global Quote"][key];
		return accumulator;
	}, {});
	return parsedResult as StockQuote;
};

export interface RawEarningsReport {
	[key: string]: string;
	fiscalDateEnding: string;
	reportedDate: string;
	reportedEPS: string;
	estimatedEPS: string;
	surprise: string;
	surprisePercentage: string;
}

export interface RawEarningsSearchResponse {
	"Note"?: string;
	"symbol": string;
	"annualEarnings"?: Record<string, string>[];
	"quarterlyEarnings"?: RawEarningsReport[];
}

export const earningsReportMap = {
	fiscalDateEnding: "fiscalDateEnding",
	reportedEPS: "reportedEPS",
};

export const parseEarningsSearchResponse = (response: RawEarningsSearchResponse, map: Record<string, string>): EarningsResponse => {
	if (isRateLimitingResponse(response)) {
		throw new RateLimitError();
	}
	let parsedResponse: any;
	if (response.quarterlyEarnings !== undefined) {
		parsedResponse = {
			reports: response.quarterlyEarnings.map((report: RawEarningsReport) => {
				const parsedReport: any = Object.entries(earningsReportMap).reduce((accumulator: Record<string, string>, [key, value]: [string, string]) => {
					accumulator[value] = report[key];
					return accumulator;
				}, {});
				return parsedReport as EarningsReport;
			})
		};
	} else {
		parsedResponse = {
			reports: []
		};
	}
	return parsedResponse as EarningsResponse;
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
					reject(new Error("Bad response from API"));
					return;
				}
				response.json()
					.then((response: RawResponseType): void => {
						const parsedResponse = parser(response, stockSearchResultMap);
						resolve(parsedResponse);
					})
					.catch(reject);
			})
			.catch((response: Response): void => {
				reject(new Error("HTTP connection failure"));
			});
	});
};

export const isRateLimitingResponse = (response: RawStockSearchResponse | RawQuoteSearchResponse | RawEarningsSearchResponse): boolean => {
	return response.Note !== undefined && response.Note.includes("Thank you for using Alpha Vantage!");
};
