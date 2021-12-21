import React from "react";
import { useRecoilValue } from "recoil";

import { pinnedStocksState, PinnedStock } from "../state/state";
import { Stock } from "../stock/stock";

export const Compare = (): React.ReactElement => {
	const pinnedStocks = useRecoilValue<PinnedStock[]>(pinnedStocksState);

	return (
		<>
			<h3>Comparison</h3>
			{ pinnedStocks.map((pinnedStock: PinnedStock) => {
				return <Stock key={pinnedStock.key} stock={pinnedStock} />
			}) }
		</>
	);
};