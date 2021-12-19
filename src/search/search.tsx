import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { useDebouncedCallback } from "use-debounce";

import { pinnedStocksState, PinnedStock } from "../app";
import { stockSearch, StockSearchResult } from "../api/alphavantage";

export const SearchResult = (result: StockSearchResult): React.ReactElement => {
	const [pinnedStocks, setPinnedStocks] = useRecoilState(pinnedStocksState);
	
	const handleClick = () => {
		const stock: PinnedStock = {
			symbol: result.symbol
		};
		setPinnedStocks([...pinnedStocks, stock])
	};

	return (
		<li>
			<button type="button" onClick={handleClick}>
				{ result.symbol }
			</button>
		</li>
	);
};

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
	}, 500);

	return (
		<div className="search">
			<label htmlFor="search">Search for stocks</label>
			<input type="text" id="search" placeholder="GME, GameStop, games" value={input} onChange={handleChange} />
			<div className="results">
				<ol>
					{ searchResults.map((result) => <SearchResult {...result} />) }
				</ol>
			</div>
		</div>
	);
};