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


/**
 * Searches for stocks matching the given query
 */
export const stockSearch = (query: string): Promise<StockSearchResponse> => {
	return alphaVantageRequest<RawStockSearchResponse, StockSearchResponse>("SYMBOL_SEARCH", { keywords: query }, parseStockSearchResponse);
};

/**
 * Retrieves a quote for the given stock symbol
 */
export const quoteSearch = (symbol: string): Promise<StockQuote> => {
	return alphaVantageRequest<RawQuoteSearchResponse, StockQuote>("GLOBAL_QUOTE", { symbol: symbol }, parseQuoteSearchResponse);
};

/**
 * Retrieves earnings reports for the given stock symbol
 */
export const earningsSearch = (symbol: string): Promise<EarningsResponse> => {
	return alphaVantageRequest<RawEarningsSearchResponse, EarningsResponse>("EARNINGS", { symbol: symbol }, parseEarningsSearchResponse);
};
