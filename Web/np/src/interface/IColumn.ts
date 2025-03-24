import { ReactElement } from 'react';

export interface IColumn<T> {
    key: string;
    title: string | ReactElement;
    render?: (column: IColumn<T>, item: T) => ReactElement;
}