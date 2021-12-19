import React from "react";

import { Search } from "../search/search";
import { Compare } from "../compare/compare";

export const Dashboard = (): React.ReactElement => {
	return (
		<>
			<h2>Stonkboard</h2>
			<Search />
			<Compare />
		</>
	);
};
