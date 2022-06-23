/**
 * See https://github.com/zeit/next.js/blob/canary/examples/with-sentry-simple/pages/_error.js
 * https://github.com/zeit/next.js/pull/8684
 */

import React from "react";
import NextError, { ErrorProps } from "next/error";
import { NextPageContext } from "next";
import ono from "@jsdevtools/ono";
import handleException from "@/utils/handle-exception";

type ErrorPageProps = ErrorProps & {
	hasGetInitialPropsRun: boolean;
	err: Error;
};

class ErrorPage extends React.Component<ErrorPageProps> {
	static async getInitialProps(ctx: NextPageContext) {
		const { res, err, asPath } = ctx;
		const nextErrorInitialProps = await NextError.getInitialProps(ctx);

		// Workaround for https://github.com/zeit/next.js/issues/8592, mark when
		// getInitialProps has run
		const NextErrorInitialProps = nextErrorInitialProps as ErrorPageProps;
		NextErrorInitialProps.hasGetInitialPropsRun = true;

		if (res) {
			// Running on the server, the response object is available.
			//
			// Next.js will pass an err on the server if a page's `getInitialProps`
			// threw or returned a Promise that rejected

			if (res.statusCode === 404) {
				// Opinionated: do not record an exception in Sentry for 404
				return { statusCode: 404 };
			}

			if (err) {
				handleException(err);

				return NextErrorInitialProps;
			}
		} else if (err) {
			// Running on the client (browser).
			//
			// Next.js will provide an err if:
			//
			//  - a page's `getInitialProps` threw or returned a Promise that rejected
			//  - an exception was thrown somewhere in the React lifecycle (render,
			//    componentDidMount, etc) that was caught by Next.js's React NextError
			//    Boundary. Read more about what types of exceptions are caught by NextError
			//    Boundaries: https://reactjs.org/docs/NextError-boundaries.html
			handleException(err);

			return NextErrorInitialProps;
		}

		// If this point is reached, getInitialProps was called without any
		// information about what the NextError might be. This is unexpected and may
		// indicate a bug introduced in Next.js, so record it in Sentry
		handleException(
			ono(`_error.jsx getInitialProps missing data at path: ${asPath}`),
			null
		);

		return NextErrorInitialProps;
	}

	render() {
		const { statusCode, hasGetInitialPropsRun, err } = this.props;

		if (!hasGetInitialPropsRun && err) {
			// getInitialProps is not called in case of
			// https://github.com/zeit/next.js/issues/8592. As a workaround, we pass
			// err via _app.js so it can be captured
			handleException(err);
		}

		return <NextError statusCode={statusCode} />;
	}
}

export default ErrorPage;
