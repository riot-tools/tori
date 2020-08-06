import { createStream } from 'riot-meiosis';

const initialState = {
    isFetching: false,
    data: [],
    error: null
};

const reducer = (newState, oldState) => ({
    ...oldState,
    ...newState
});

createStream(reducer, initialState);
