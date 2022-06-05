import { Breakpoints } from "@/types";

export const isXSmall = `@media (max-width: ${Breakpoints.xSmall - 1}px)`;
export const gtXSmall = `@media (min-width: ${Breakpoints.xSmall}px)`;
export const isSmall = `@media (max-width: ${Breakpoints.small - 1}px)`;
export const gtSmall = `@media (min-width: ${Breakpoints.small}px)`;
export const isMedium = `@media (max-width: ${Breakpoints.medium - 1}px)`;
export const gtMedium = `@media (min-width: ${Breakpoints.medium}px)`;
export const isLarge = `@media (max-width: ${Breakpoints.large - 1}px)`;
export const gtLarge = `@media (min-width: ${Breakpoints.large}px)`;
export const isXLarge = `@media (max-width: ${Breakpoints.xLarge - 1}px)`;
export const gtXLarge = `@media (min-width: ${Breakpoints.xLarge}px)`;
