import { Pane } from "evergreen-ui";
import { ITableProps, kaReducer, Table } from "ka-table";
import {
	hideLoading,
	loadData,
	setSingleAction,
	showLoading,
	updateData
} from "ka-table/actionCreators";
import { ActionType, DataType, SortingMode } from "ka-table/enums";
import { DispatchFunc } from "ka-table/types";
import React, { useEffect, useState } from "react";
import { format } from "timeago.js";

import { useCollections } from "@/hooks/use-collections";
import pascalCase from "@/utils/pascal-case";

type Props = {};

const tablePropsInit: ITableProps = {
	height: "100%",
	format: ({ value, column }) => {
		if (column.key === "timestamp") {
			return format(value);
		}
		if (column.key === "connection") {
			return pascalCase(value);
		}
		return value;
	},
	columns: [
		{
			key: "address",
			title: "Address",
			dataType: DataType.String,
			width: "360px"
		},
		{
			key: "timestamp",
			title: "Last Activity",
			dataType: DataType.Date,
			width: "150px"
		},
		{
			key: "connection",
			title: "Connection Type",
			dataType: DataType.String,
			width: "160px"
		}
	],
	rowKeyField: "id",
	sortingMode: SortingMode.Single
};

const LinkVisitorsList: React.FC<Props> = () => {
	const { connections, isConnectionsLoading } = useCollections();

	const [tableProps, changeTableProps] = useState(tablePropsInit);

	const dispatch: DispatchFunc = React.useCallback(
		(action) => {
			changeTableProps((prevState: ITableProps) =>
				kaReducer(prevState, action)
			);

			if (action.type === ActionType.LoadData) {
				dispatch(showLoading());
				dispatch(updateData(connections));
				dispatch(hideLoading());
			} else if (action.type === ActionType.UpdatePageIndex) {
				dispatch(setSingleAction(loadData()));
			}
		},
		[connections]
	);

	useEffect(() => {
		dispatch(loadData());
	}, [connections, dispatch]);

	useEffect(() => {
		if (isConnectionsLoading) {
			dispatch(showLoading());
		} else {
			dispatch(hideLoading());
		}
	}, [dispatch, isConnectionsLoading]);

	return (
		<Pane flex="1" overflow="hidden">
			<Table {...tableProps} dispatch={dispatch} />
		</Pane>
	);
};

export default LinkVisitorsList;
