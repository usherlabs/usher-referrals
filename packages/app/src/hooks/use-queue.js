/* eslint-disable */
/**
 * See https://raw.githubusercontent.com/baughmann/react-use-queue/master/index.tsx
 */

import { useState, useEffect, useReducer } from "react";
///////////////////////////////
//// Reducers
///////////////////////////////
// `ADD` is for adding a new task and `SHIFT` is for removing a completed job, i.e. shifting the window
var ActionType;
(function (ActionType) {
	ActionType[(ActionType["ADD"] = 0)] = "ADD";
	ActionType[(ActionType["SHIFT"] = 1)] = "SHIFT";
	ActionType[(ActionType["EMPTY"] = 2)] = "EMPTY";
})(ActionType || (ActionType = {}));
// all pretty self-explanatory
const jobsReducer = (jobs, action) => {
	switch (action.type) {
		case ActionType.ADD:
			return [...jobs, action.job];
		case ActionType.SHIFT:
			const next = jobs;
			next.shift();
			return next;
		case ActionType.EMPTY:
			return [];
		default:
			return jobs;
	}
};
// keeps track of whether or not the queue is executing a job
const isExecutingTaskReducer = (status, action) => {
	return action;
};
///////////////////////////////
//// Implementation
///////////////////////////////
export default () => {
	// the current list of jobs to be performed
	const [jobs, dispatch] = useReducer(jobsReducer, []);
	// whether or not the queue is performing a job
	const [isExecutingTask, setIsExecutingTask] = useReducer(
		isExecutingTaskReducer,
		false
	);
	// the callback to be executed once all jobs are completed
	const [doneCallback, setDoneCallback] = useState();
	useEffect(() => {
		const func = async () => {
			if (jobs.length > 0 && !isExecutingTask) {
				setIsExecutingTask(true);
				const job = jobs[0];
				await job.task();
				dispatch({ type: ActionType.SHIFT });
				if (jobs.length === 0) {
					doneCallback && doneCallback();
				}
				setIsExecutingTask(false);
			}
		};
		func();
	}, [jobs, isExecutingTask]);
	const addJob = async (job) => {
		dispatch({ type: ActionType.ADD, job });
	};
	const empty = async () => {
		dispatch({ type: ActionType.EMPTY });
	};
	const onEmpty = (callback) => {
		setDoneCallback(callback);
	};
	return { empty, addJob, onEmpty, isExecutingTask };
};
