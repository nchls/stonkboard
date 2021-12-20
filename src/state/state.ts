import { atom } from "recoil";

import { StockQuote } from "../api/alphavantage";

export interface PinnedStock {
	symbol: string;
}

export const pinnedStocksState = atom({
	key: "pinnedStocks",
	default: [] as PinnedStock[],
});

export interface CachedStock {
	quote?: StockQuote;
}

export const cachedStocksState = atom({
	key: "cachedStocks",
	default: {} as Record<string, CachedStock>,
});
