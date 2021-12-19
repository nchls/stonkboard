import React from "react";
import { render } from "react-dom";
import { RecoilRoot, atom } from "recoil";

import { Dashboard } from "./dashboard/dashboard";

export interface PinnedStock {
	symbol: string;
}

export const pinnedStocksState = atom({
	key: "pinnedStocks",
	default: [] as PinnedStock[],
});

render(
	(
		<RecoilRoot>
			<Dashboard />
		</RecoilRoot>
	), 
	document.getElementById("app")
);
