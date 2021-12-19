import React from "react";

import { PinnedStock } from "../app";

interface StockProps {
	stock: PinnedStock;
}

export const Stock = ({ stock }: StockProps): React.ReactElement => {
	return (
		<h4 className="stock">{ stock.symbol }</h4>
	);
};
