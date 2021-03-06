import { Reducer } from 'redux';
import { CONFIG } from '../../../config';
import { PlayerActionTypes } from '../player';
import { ConfigActionTypes, ConfigState } from './types';
import { clone, setWith, curry } from 'lodash/fp';

export const setIn = curry((path: string, value: string, obj: object) =>
    setWith(clone, path, value, clone(obj)),
);

const initialState = CONFIG.DEFAULT_CONFIG;

export const configReducer: Reducer<ConfigState> = (state = initialState, action) => {
    const { payload, type } = action;

    switch (type) {
        case ConfigActionTypes.SET_TOKEN:
            return {
                ...state,
                token: payload
            };
        case ConfigActionTypes.SET_ALL:
            return {
                ...state,
                ...payload
            };
        case ConfigActionTypes.SET_KEY:
            return {
                ...setIn(payload.key, payload.value, state)
            };

        case PlayerActionTypes.TOGGLE_SHUFFLE:
            return {
                ...state,
                shuffle: payload.value,
            };
        default:
            return state;
    }

};
