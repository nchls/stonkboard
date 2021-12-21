import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { getUnixTime, fromUnixTime, parseISO, format } from 'date-fns';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { quoteSearch, earningsSearch, EarningsReport } from "../api/alphavantage";
import { PinnedStock, pinnedStocksState, CachedStock, cachedStocksState } from "../state/state";


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
					console.error(err);
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
			{ cachedStock?.quote ? (
				<p>Open: { cachedStock?.quote?.open }</p>
			) : null}
			{ earningsData.length ? (
				<ResponsiveContainer width="100%" height={200}>
					<LineChart data={earningsData}>
						<Line type="monotone" dataKey="EPS" stroke="#8884d8" />
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
				onClick={unpinStock}
			>
				Remove
			</button>
		</div>
	);
};
