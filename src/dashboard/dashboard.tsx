import React from "react";

import { Search } from "../search/search";
import { Compare } from "../compare/compare";

export const Dashboard = (): React.ReactElement => {
	return (
		<div className="wrap">
			<h1 className="app-header">Stonkboard</h1>
			<Search />
			<Compare />
		</div>
	);
};
