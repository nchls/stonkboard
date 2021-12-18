import React from "react";
import { Search } from "../search/search";

export const Dashboard = (): React.ReactElement => {
	return (
		<>
			<h2>Stonkboard</h2>
			<p>I'm a dashboard.</p>
			<Search />
		</>
	);
};
