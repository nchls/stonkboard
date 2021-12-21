import React, { useEffect } from "react";
import { useRecoilState } from "recoil";

import { quoteSearch } from "../api/alphavantage";
import { PinnedStock, pinnedStocksState, CachedStock, cachedStocksState } from "../state/state";

interface StockProps {
	stock: PinnedStock;
}

export const Stock = ({ stock }: StockProps): React.ReactElement => {
	const [cachedStocks, setCachedStocks] = useRecoilState<Record<string, CachedStock>>(cachedStocksState);
	const [pinnedStocks, setPinnedStocks] = useRecoilState<PinnedStock[]>(pinnedStocksState);

	const cachedStock: CachedStock = cachedStocks[stock.key];

	useEffect(() => {
		(async () => {
			if (cachedStock === undefined) {
				try {
					const quote = await quoteSearch(stock.symbol);
					setCachedStocks({
						...cachedStocks,
						[stock.key]: {
							quote: quote,
						}
					});
				} catch (err) {
					console.error(err);
				}
			}
		})();
	}, [cachedStock]);

	const unpinStock = () => {
		const idx = pinnedStocks.indexOf(stock);
		const rest = [...pinnedStocks]
		rest.splice(idx, 1);
		setPinnedStocks(rest);
	};

	return (
		<div className="stock">
			<h4 className="symbol">{ stock.symbol }</h4>
			<p>Open: { cachedStock?.quote?.open }</p>
			<button
				type="button"
				onClick={unpinStock}
			>
				Remove
			</button>
		</div>
	);
};
