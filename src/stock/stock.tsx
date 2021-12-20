import React, { useEffect } from "react";
import { useRecoilState } from "recoil";

import { quoteSearch } from "../api/alphavantage";
import { PinnedStock, cachedStocksState, CachedStock } from "../state/state";

interface StockProps {
	stock: PinnedStock;
}

export const Stock = ({ stock }: StockProps): React.ReactElement => {
	const [cachedStocks, setCachedStocks] = useRecoilState<Record<string, CachedStock>>(cachedStocksState);

	const cachedStock: CachedStock = cachedStocks[stock.symbol];

	useEffect(() => {
		(async () => {
			if (cachedStock === undefined) {
				try {
					const quote = await quoteSearch(stock.symbol);
					setCachedStocks({
						...cachedStocks,
						[stock.symbol]: {
							quote: quote,
						}
					});
				} catch (err) {
					console.error(err);
				}
				
			}
		})();
	}, [cachedStock]);

	return (
		<div className="stock">
			<h4 className="symbol">{ stock.symbol }</h4>
			<p>Open: { cachedStock?.quote?.open }</p>
		</div>
	);
};
