import React, { useState, useRef, MutableRefObject, LegacyRef, RefObject } from "react";
import { useRecoilState } from "recoil";
import { useDebouncedCallback } from "use-debounce";

import { pinnedStocksState, PinnedStock } from "../state/state";
import { stockSearch, StockSearchResult } from "../api/alphavantage";

const MAX_PINNED_STOCKS = 3;

export const getUniqueResultKey = (result: StockSearchResult): string => `${result.symbol}~${result.name}`;

const resultRefs: RefObject<HTMLButtonElement | undefined>[] = [];

export const Search = (): React.ReactElement => {
	const [input, setInput] = useState<string>("");
	const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
	const [pinnedStocks, setPinnedStocks] = useRecoilState<PinnedStock[]>(pinnedStocksState);
	
	const isMaxPinsReached = (pinnedStocks.length >= MAX_PINNED_STOCKS);

	const searchRef = useRef<HTMLInputElement>(null);
	
	const handleSearchKeyDown = (evt: React.KeyboardEvent) => {
		if (evt.key === "ArrowDown") {
			evt.preventDefault();
			resultRefs[0].current?.focus();
		}
	};

	const handleResultKeyDown = (evt: React.KeyboardEvent, index: number) => {
		if (["ArrowUp", "ArrowDown"].includes(evt.key)) {
			evt.preventDefault();
			const prev = resultRefs[index-1];
			const next = resultRefs[index+1];
			if (evt.key === "ArrowDown") {
				if (next !== undefined) {
					next.current?.focus();
				} else {
					resultRefs[0].current?.focus();
				}
			} else {
				if (prev !== undefined) {
					prev.current?.focus();
				} else {
					searchRef.current?.focus();
				}
			}
		}
	};

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
			setSearchResults([]);
		}
	}, 400);

	const handleResultClick = (result: StockSearchResult) => {
		const stock: PinnedStock = {
			symbol: result.symbol,
			key: getUniqueResultKey(result),
		};
		setPinnedStocks([...pinnedStocks, stock])
	};

	return (
		<>
			<div className="search">
				<div className="search-field">
					<label htmlFor="search" className="is-sr-only">Search for stocks</label>
					<input 
						type="text" 
						id="search" 
						placeholder="Search for stocks" 
						value={input} 
						ref={searchRef}
						onChange={handleChange}
						onKeyDown={handleSearchKeyDown}
					/>
				</div>
			</div>
			{ searchResults.length ? (
				<div className="results">
					<ol>
						{ searchResults.map((result: StockSearchResult, index: number) => {
							const uniqueKey = getUniqueResultKey(result);
							const isStockPinned = pinnedStocks.some((pinnedStock) => pinnedStock.key === uniqueKey);
							const isSelectable = !isMaxPinsReached && !isStockPinned;

							return (
								<SearchResult 
									key={uniqueKey}
									result={result} 
									index={index}
									isSelectable={isSelectable}
									isMaxPinsReached={isMaxPinsReached}
									handleResultClick={handleResultClick}
									handleResultKeyDown={handleResultKeyDown}
								/>
							);
						}) }
					</ol>
				</div>
			) : null }
		</>
	);
};

interface SearchResultProps {
	result: StockSearchResult;
	index: number;
	isSelectable: boolean;
	isMaxPinsReached: boolean;
	handleResultClick: (result: StockSearchResult) => void;
	handleResultKeyDown: (evt: React.KeyboardEvent, index: number) => void;
}

export const SearchResult = ({ 
	result, 
	index, 
	isSelectable, 
	isMaxPinsReached,
	handleResultClick,
	handleResultKeyDown,
}: SearchResultProps): React.ReactElement => {
	resultRefs[index] = React.createRef();

	return (
		<li className="result">
			<button
				type="button"
				onClick={() => { isSelectable && handleResultClick(result) }} 
				className={isSelectable ? "" : "unselectable"}
				title={isMaxPinsReached ? "Remove a stock to pin a new one." : ""}
				ref={resultRefs[index] as LegacyRef<HTMLButtonElement>}
				onKeyDown={(evt) => handleResultKeyDown(evt, index)}
			>
				<div className="symbol">{ result.symbol }</div>
				<div className="name">{ result.name }</div>
				<div className="type">{ result.type }</div>
			</button>
		</li>
	);
};
