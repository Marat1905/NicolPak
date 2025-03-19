import React, { useState, useMemo, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
//import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { Container } from "@material-ui/core";
import { useNavigate, useSearchParams } from "react-router-dom";
//import TextField from '@material-ui/core/TextField';
import { TamburHook } from '../../hooks';
import { TamburService } from '../../utility/services/tamburService'
import { ITambur } from '../../interface'
import moment from "moment-timezone";  

interface Column {
    id: 'id' | 'TamburContPrs' | 'CreateAt';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: Column[] = [
    { id: 'id', label: 'Идентификатор', minWidth: 100 },
    { id: 'TamburContPrs', label: 'Идентификатор по ПРС', minWidth: 100 },
    {
        id: 'CreateAt',
        label: 'Время создания',
        minWidth: 100
    },

];

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});

export const AllTambur = () => {
    const { data: tamburs, loading, setData: setUser, error } = TamburHook(true);

    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('filter') || '');

    const navigate = useNavigate();
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const filteredData = useMemo(() => {
        return tamburs.filter(x => !search)
    }, [tamburs, search])

    return (
        <>
            <Container>
                <h1>Информация по тамбурам</h1>
                <Paper className={classes.root}>
                    <TableContainer className={classes.container}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tamburs.map((record: ITambur) => {
                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell>{record.id}</TableCell>
                                            <TableCell>{record.tamburContPrs}</TableCell>
                                            <TableCell>{moment(new Date(record.createAt != undefined ? record.createAt! : ''))
                                                .utc(false)
                                                .local()
                                                .format("DD/MM/YYYY hh:mm:ss")}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {/*{filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record: ITambur) => {*/}
                                {/*    return (*/}
                                {/*        <TableRow key={record.id }>*/}
                                {/*            <TableCell>{record.id}</TableCell>*/}
                                {/*            <TableCell>{record.tamburContPrs}</TableCell>*/}
                                {/*            <TableCell>{moment(new Date(record.createAt != undefined ? record.createAt! : ''))*/}
                                {/*                .utc(true)*/}
                                {/*                .local()*/}
                                {/*                .format("DD/MM/YYYY hh:mm:ss")}*/}
                                {/*            </TableCell>*/}
                                {/*        </TableRow>*/}
                                {/*    );*/}
                                {/*})}*/}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/*<TablePagination*/}
                    {/*    rowsPerPageOptions={[10, 25, 100]}*/}
                    {/*    component="div"*/}
                    {/*    count={tamburs.length}*/}
                    {/*    rowsPerPage={rowsPerPage}*/}
                    {/*    page={page}*/}
                    {/*    onPageChange={handleChangePage}*/}
                    {/*    onRowsPerPageChange={handleChangeRowsPerPage}*/}
                    {/*/>*/}
                </Paper>
            </Container>
        </>
    );
}