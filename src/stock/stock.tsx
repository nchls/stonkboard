import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { getUnixTime, fromUnixTime, parseISO, format } from 'date-fns';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { quoteSearch, earningsSearch } from "../api/api";
import { PinnedStock, pinnedStocksState, CachedStock, cachedStocksState } from "../state/state";
import { EarningsReport, RateLimitError } from "../api/interfaces";


interface StockProps {
	stock: PinnedStock;
}

interface EarningsDataPoint {
	ts: number;
	EPS: number;
}

// Five years of quarterly reports
const MAX_REPORTS = 20;

export const getEarningsData = (reports: EarningsReport[] | undefined): [EarningsDataPoint[], number, number] => {
	let dataPoints: EarningsDataPoint[] = [];
	let minEPS = Infinity;
	let maxEPS = -Infinity;
	if (reports !== undefined) {
		dataPoints = reports.slice(0, MAX_REPORTS).map((report: EarningsReport) => {
			const dt = parseISO(report.fiscalDateEnding);
			const ts = getUnixTime(dt);
			const eps = parseFloat(report.reportedEPS);
			minEPS = Math.min(minEPS, eps);
			maxEPS = Math.max(maxEPS, eps);
			return {
				ts: ts,
				EPS: eps
			};
		}).reverse();
	}
	return [dataPoints, minEPS, maxEPS];
};

export const formatChartDate = (ts: number): string => {
	return format(fromUnixTime(ts), "MMM yyyy");
};

export const Stock = ({ stock }: StockProps): React.ReactElement => {
	const [cachedStocks, setCachedStocks] = useRecoilState<Record<string, CachedStock>>(cachedStocksState);
	const [pinnedStocks, setPinnedStocks] = useRecoilState<PinnedStock[]>(pinnedStocksState);
	const [requestError, setRequestError] = useState<Error | undefined>();

	const cachedStock: CachedStock = cachedStocks[stock.key];

	useEffect(() => {
		(async () => {
			if (cachedStock === undefined) {
				try {
					const [quote, earnings] = await Promise.all([
						await quoteSearch(stock.symbol), 
						await earningsSearch(stock.symbol)
					]);
					setCachedStocks({
						...cachedStocks,
						[stock.key]: {
							quote: quote,
							earnings: earnings,
						},
					});
				} catch (err) {
					setRequestError(err as Error);
					if (!(err instanceof RateLimitError)) {
						console.error(err);
					}
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

	const [earningsData, minEPS, maxEPS] = getEarningsData(cachedStock?.earnings?.reports);

	return (
		<div className="stock">
			<h4 className="symbol">{ stock.symbol }</h4>
			{ requestError !== undefined ? (
				<p className="stock-error">
					{ requestError instanceof RateLimitError 
						? "Rate limit exceeded :(. Try again in a minute." 
						: "Unexpected error!" }
				</p>
			) : null }			
			{ cachedStock?.quote ? (
				<p>Open: { cachedStock?.quote?.open }</p>
			) : null}
			{ earningsData.length ? (
				<ResponsiveContainer width="100%" height={200}>
					<LineChart data={earningsData}>
						<Line type="monotone" dataKey="EPS" stroke="#8884d8" fill="#dddddd" />
						<CartesianGrid stroke="#ccc" />
						<XAxis 
							dataKey="ts"
							tickFormatter={formatChartDate}
						/>
						<YAxis />
						<Tooltip formatter={(val: string) => val} labelFormatter={formatChartDate} />
					</LineChart>
				</ResponsiveContainer>
			) : null }
  			<button
				type="button"
				title="Remove"
				className="remove-stock button is-small is-danger"
				onClick={unpinStock}
			>
				<span className="is-sr-only">Remove</span>
				<span aria-hidden="true">✖</span>
			</button>
		</div>
	);
};
