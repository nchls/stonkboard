import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { useDebouncedCallback } from "use-debounce";

import { pinnedStocksState, PinnedStock } from "../state/state";
import { stockSearch, StockSearchResult } from "../api/alphavantage";

const MAX_PINNED_STOCKS = 3;

export const getUniqueResultKey = (result: StockSearchResult): string => `${result.symbol}~${result.name}`;

export const Search = (): React.ReactElement => {
	const [input, setInput] = useState<string>("");
	const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);

	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const query = evt.target.value;
		setInput(query);
		performSearch(query);
	};

	const performSearch = useDebouncedCallback(async (query: string): Promise<void> => {
		if (query.length === 0) {
			setSearchResults([]);
			return;
		}
		try {
			const results = await stockSearch(query);
			setSearchResults(results.bestMatches);
		} catch (err) {
			console.error(err);
		}
	}, 400);

	return (
		<div className="search">
			<label htmlFor="search">Search for stocks</label>
			<input type="text" id="search" placeholder="GME, GameStop, games" value={input} onChange={handleChange} />
			<div className="results">
				<ol>
					{ searchResults.map((result: StockSearchResult) => (
						<SearchResult key={getUniqueResultKey(result)} {...result} />
					)) }
				</ol>
			</div>
		</div>
	);
};

export const SearchResult = (result: StockSearchResult): React.ReactElement => {
	const [pinnedStocks, setPinnedStocks] = useRecoilState<PinnedStock[]>(pinnedStocksState);
	
	const handleClick = () => {
		const stock: PinnedStock = {
			symbol: result.symbol,
			key: getUniqueResultKey(result),
		};
		setPinnedStocks([...pinnedStocks, stock])
	};

	const isMaxPinsReached = (pinnedStocks.length >= MAX_PINNED_STOCKS);
	const isStockPinned = pinnedStocks.some((pinnedStock) => pinnedStock.key === getUniqueResultKey(result))

	return (
		<li>
			<button 
				type="button" 
				onClick={handleClick} 
				disabled={isMaxPinsReached || isStockPinned}
				title={isMaxPinsReached ? "Remove a stock to pin a new one." : ""}
			>
				{ result.symbol }
			</button>
		</li>
	);
};

