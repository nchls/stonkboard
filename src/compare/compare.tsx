import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
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

/**
 * Formats an array of earnings reports into one suitable for rendering with Recharts
 */
export const getEarningsData = (reports: EarningsReport[] | undefined): EarningsDataPoint[] => {
	let dataPoints: EarningsDataPoint[] = [];
	if (reports !== undefined) {
		dataPoints = reports.slice(0, MAX_REPORTS).map((report: EarningsReport) => {
			const dt = parseISO(report.fiscalDateEnding);
			const ts = getUnixTime(dt);
			const eps = parseFloat(report.reportedEPS);
			return {
				ts: ts,
				EPS: eps
			};
		}).reverse();
	}
	return dataPoints;
};

/**
 * Formats a YYYY-MM-DD date into one suitable for rendering with Recharts
 */
export const formatChartDate = (ts: number): string => {
	return format(fromUnixTime(ts), "MMM yyyy");
};

export const Compare = (): React.ReactElement => {
	const pinnedStocks = useRecoilValue<PinnedStock[]>(pinnedStocksState);

	return (
		<div className="pinned-stocks">
			{ pinnedStocks.map((pinnedStock: PinnedStock) => {
				return <Stock key={pinnedStock.key} stock={pinnedStock} />
			}) }
		</div>
	);
};

export const Stock = ({ stock }: StockProps): React.ReactElement => {
	const [cachedStocks, setCachedStocks] = useRecoilState<Record<string, CachedStock>>(cachedStocksState);
	const [pinnedStocks, setPinnedStocks] = useRecoilState<PinnedStock[]>(pinnedStocksState);
	const [requestError, setRequestError] = useState<Error | undefined>();

	const cachedStock: CachedStock = cachedStocks[stock.key];

	// Retrieve quote and earnings on mount and cache in the Recoil state
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

	const earningsData = getEarningsData(cachedStock?.earnings?.reports);

	return (
		<div className="stock">
			<h4><span className="symbol">{ stock.symbol }</span>&nbsp;&nbsp;{ stock.name }</h4>
			{ requestError !== undefined ? (
				<p className="stock-error">
					{ requestError instanceof RateLimitError 
						? "Rate limit exceeded :(. Try again in a minute." 
						: "Unexpected error!" }
				</p>
			) : null }
			{ cachedStock?.quote ? (
				<div className="stats">
					<div className="price">${ cachedStock?.quote?.price }</div>
					<div className="change-percent">
						{ parseFloat(cachedStock?.quote?.changePercent) > 0
							? "???? "
							: "???? "
						}
						{ cachedStock?.quote?.changePercent }
					</div>
				</div>
			) : null}
			<figure className="earnings-chart">
				<figcaption className="is-sr-only">Earnings per share</figcaption>
				{ earningsData.length ? (
					<ResponsiveContainer width="100%" height={160}>
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
			</figure>
  			<button
				type="button"
				title="Remove"
				className="remove-stock button is-small is-danger"
				onClick={unpinStock}
			>
				<span className="is-sr-only">Remove</span>
				<span aria-hidden="true">???</span>
			</button>
		</div>
	);
};
