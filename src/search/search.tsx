import React from "react";

export const Search = (): React.ReactElement => {
	return (
		<div className="search">
			<label htmlFor="search">Search for stocks</label>
			<input type="text" id="search" placeholder="GME, GameStop, games"/>
		</div>
	);
};