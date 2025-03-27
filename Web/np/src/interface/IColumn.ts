import { ReactElement } from 'react';

export interface IColumn<T, K extends keyof T>{
    key: K;
    title: string;
    filter?: boolean;
    render?: (column: IColumn<T,K>) => ReactElement;
}

