import {  Values } from 'inferred-types/types';
import { TERM_PROGRAM_LOOKUP, TERMINAL_APPS } from '../constants';


export type TerminalApp = Values<typeof TERMINAL_APPS>
