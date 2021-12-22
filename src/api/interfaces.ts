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

export interface StockQuote {
	createdTime: number;
	open: string;
	high: string;
	low: string;
	price: string;
	changePercent: string;
}

export interface EarningsReport {
	fiscalDateEnding: string;
	reportedEPS: string;
}

export interface EarningsResponse {
	createdTime: number;
	reports: EarningsReport[];
}