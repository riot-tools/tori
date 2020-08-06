import { getStream } from 'riot-meiosis';

const stream = getStream();

export const setFetching = (isFetching) => stream.push({ isFetching })

export const fetchData = async (filter) => {

    setFetching(true);

    const { data } = await api.post('/search', filter);

    stream.push({ data: data.results });

    setFetching(true);
};

export const fetchOne = async () => {

    setFetching(true);

    const { data } = await api.get('/item/1');

    stream.push({ current: data });

    setFetching(false);
};
