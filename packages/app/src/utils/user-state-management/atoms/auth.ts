import { atom } from "jotai/index";
import { API_OPTIONS, AUTH_OPTIONS } from "@/constants";
import { Authenticate } from "@usher.so/auth";
import { Partnerships } from "@usher.so/partnerships";

const authenticationInstanceAtom = atom(
	() => new Authenticate({}, AUTH_OPTIONS)
);

const partnershipsInstanceAtom = atom(
	(get) => new Partnerships(get(authenticationInstanceAtom), API_OPTIONS)
);

export const usherInstancesAtoms = {
	authentication: authenticationInstanceAtom,
	partnerships: partnershipsInstanceAtom
};
