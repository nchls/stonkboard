import React, { useState, useRef, MutableRefObject, LegacyRef, RefObject } from "react";
import { useRecoilState } from "recoil";
import { useDebouncedCallback } from "use-debounce";

import { pinnedStocksState, PinnedStock } from "../state/state";
import { stockSearch } from "../api/api";
import { RateLimitError, StockSearchResult } from "../api/interfaces";

const MAX_PINNED_STOCKS = 3;

export const getUniqueResultKey = (result: StockSearchResult): string => `${result.symbol}~${result.name}`;

const resultRefs: RefObject<HTMLButtonElement | undefined>[] = [];

export const Search = (): React.ReactElement => {
	const [input, setInput] = useState<string>("");
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
	const [requestError, setRequestError] = useState<Error | undefined>();
	const [pinnedStocks, setPinnedStocks] = useRecoilState<PinnedStock[]>(pinnedStocksState);
	
	const isMaxPinsReached = (pinnedStocks.length >= MAX_PINNED_STOCKS);

	// Prepare a ref for setting focus back on the search field
	const searchRef = useRef<HTMLInputElement>(null);
	
	// Arrow down in the search field should move focus to the first search result
	const handleSearchKeyDown = (evt: React.KeyboardEvent) => {
		if (evt.key === "ArrowDown" && resultRefs[0] !== undefined) {
			evt.preventDefault();
			resultRefs[0].current?.focus();
		}
	};

	const handleResultKeyDown = (evt: React.KeyboardEvent, index: number) => {
		if (["ArrowUp", "ArrowDown"].includes(evt.key)) {
			evt.preventDefault();
			const prev = resultRefs[index-1];
			const next = resultRefs[index+1];

			// Arrow down on a result
			if (evt.key === "ArrowDown") {
				if (next !== undefined) {
					// Move focus to the next if possible
					next.current?.focus();
				} else {
					// Otherwise move focus to the first
					resultRefs[0].current?.focus();
				}
			// Arrow up on a result
			} else {
				if (prev !== undefined) {
					// Move focus to the previous if possible
					prev.current?.focus();
				} else {
					// Otherwise move focus back to the search box
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
		// Clear search results when the search term is erased
		if (query.length === 0) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		// Perform the search
		try {
			setIsSearching(true);
			const results = await stockSearch(query);
			setSearchResults(results.bestMatches);
			setRequestError(undefined);
		} catch (err) {
			setSearchResults([]);
			setRequestError(err as Error);
			if (!(err instanceof RateLimitError)) {
				console.error(err);
			}
		}
		setIsSearching(false);
	}, 400);

	const handleResultClick = (result: StockSearchResult) => {
		const stock: PinnedStock = {
			symbol: result.symbol,
			name: result.name,
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
						role="searchbox"
						placeholder="Search for stocks" 
						value={input} 
						ref={searchRef}
						onChange={handleChange}
						onKeyDown={handleSearchKeyDown}
					/>
				</div>
				{ requestError !== undefined ? (
					<div className="search-message">
						{ requestError instanceof RateLimitError 
							? "Rate limit exceeded :(. Try again in a minute." 
							: "Unexpected error!" }
					</div>
				) : (
					isSearching ? <div className="search-message">Searching...</div> : null
				) }
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
