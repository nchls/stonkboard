import { atom } from "recoil";

import { StockQuote, EarningsResponse } from "../api/interfaces";

export interface PinnedStock {
	symbol: string;
	name: string;
	key: string;
}

export const pinnedStocksState = atom({
	key: "pinnedStocks",
	default: [] as PinnedStock[],
});

export interface CachedStock {
	quote?: StockQuote;
	earnings?: EarningsResponse;
}

export const cachedStocksState = atom({
	key: "cachedStocks",
	default: {} as Record<string, CachedStock>,
});
