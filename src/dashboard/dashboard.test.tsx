/**
 * @jest-environment jsdom
 */
 
 import React from "react";
import { act, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dashboard } from "./dashboard";
import { stockSearch, quoteSearch, earningsSearch } from "../api/api";
import { RecoilRoot } from "recoil";
import { EarningsResponse, StockQuote, StockSearchResponse, StockSearchResult } from "../api/interfaces";

jest.mock('../api/api', () => {
	return {
		stockSearch: (): Promise<StockSearchResponse> => {
			return new Promise((resolve, _): void => {
				const response: StockSearchResponse = {
					bestMatches: [
						{
							symbol: 'LMAO',
							name: 'LMF Acquisition Opportunities Inc - Class A',
							type: 'Equity',
							region: 'United States',
							marketOpen: '09:30',
							marketClose: '16:00',
							timezone: 'UTC-04',
							currency: 'USD',
							matchScore: '1.0000'
						},
					],
				};
				resolve(response);
			});
		},
		quoteSearch: (): Promise<StockQuote> => {
			return new Promise((resolve, _): void => {
				const response: StockQuote = {
					open: '10.0500',
					high: '10.0500',
					low: '10.0500',
					price: '10.0500',
					changePercent: '3.0000%'
				};
				resolve(response);
			});
		},
		earningsSearch: (): Promise<EarningsResponse> => {
			return new Promise((resolve, _): void => {
				const response: EarningsResponse = {
					reports: [
						{ fiscalDateEnding: '2021-09-30', reportedEPS: '0.0181' },
						{ fiscalDateEnding: '2021-06-30', reportedEPS: '0.0181' }
					]
				};
				resolve(response);
			});
		},
	};
});

describe('Dashboard', () => {
	it('renders search results and stocks with quotes and earnings', async () => {
		// Given: a rendered app
		const { findByText, getByRole, queryByText } = render(<RecoilRoot><Dashboard /></RecoilRoot>);
		
		// When: a search term is entered
		const search = getByRole('searchbox');
		userEvent.type(search, 'dummy');

		// Then: the mock stock is displayed
		await findByText('LMAO');

		// When: the search result is clicked
		const searchResults = getByRole('list');
		const resultButton = within(searchResults).getByRole('button');
		userEvent.click(resultButton);

		// Then: we render the stock price
		await findByText('$10.0500');
		
		// Then: we render the change percent
		await findByText('🔼 3.0000%');

		// When: the pinned stock close button is clicked
		const closeButton = await findByText('Remove');
		userEvent.click(closeButton);

		// Then: the pinned stock is removed
		expect(queryByText('$10.0500')).toEqual(null)
	});
});