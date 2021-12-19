import { FINNHUB_API_URL, FINNHUB_API_KEY } from "../settings";

export interface StockSearchResult {
	description: string;
	displaySymbol: string;
	symbol: string;
	type: string;
}

export interface StockSearchResponse {
	count: number;
	result: StockSearchResult[];
}

export const stockSearch = (query: string): Promise<StockSearchResponse> => {
	return new Promise((resolve, reject) => {
		fetch(`${FINNHUB_API_URL}v1/search?q=${query}&token=${FINNHUB_API_KEY}`)
			.then((response: Response): void => {
				if (!response.ok) {
					reject();
					return;
				}
				response.json()
					.then((data: StockSearchResponse): void => {
						console.log("data", data);
						resolve(data);
					})
					.catch((error): void => {
						console.error("error", error);
					});
			})
			.catch((response: Response): void => {
				reject(response);
			});
	});
};
