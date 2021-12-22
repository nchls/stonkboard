import { 
	alphaVantageRequest, 
	parseEarningsSearchResponse, 
	parseQuoteSearchResponse, 
	parseStockSearchResponse, 
	RawEarningsSearchResponse, 
	RawQuoteSearchResponse, 
	RawStockSearchResponse 
} from "./alphavantage";
import { 
	EarningsResponse, 
	StockQuote, 
	StockSearchResponse
} from "./interfaces";


export const stockSearch = (query: string): Promise<StockSearchResponse> => {
	return alphaVantageRequest<RawStockSearchResponse, StockSearchResponse>("SYMBOL_SEARCH", { keywords: query }, parseStockSearchResponse);
};

export const quoteSearch = (symbol: string): Promise<StockQuote> => {
	return alphaVantageRequest<RawQuoteSearchResponse, StockQuote>("GLOBAL_QUOTE", { symbol: symbol }, parseQuoteSearchResponse);
};

export const earningsSearch = (symbol: string): Promise<EarningsResponse> => {
	return alphaVantageRequest<RawEarningsSearchResponse, EarningsResponse>("EARNINGS", { symbol: symbol }, parseEarningsSearchResponse);
};
