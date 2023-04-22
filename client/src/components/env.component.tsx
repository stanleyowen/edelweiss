import {
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
} from '@mui/material';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Plus } from '../lib/icons.component';

const Environment = ({ HOST_DOMAIN }: any) => {
    const [env, setEnv] = useState<any>([]);
    const [properties, setStatus] = useState<{
        isLoading: boolean;
        dialogIsOpen: boolean;
        appName: string;
    }>({
        isLoading: false,
        dialogIsOpen: false,
        appName: '',
    });
    const [data, setData] = useState<any>({
        key: '',
        value: '',
    });
    const [page, setPage] = useState<number>(0);
    const [rowPerPage, setRowPerPage] = useState<number>(10);

    const handleData = (key: string, value: string | number) => {
        setData({ ...data, [key]: value });
    };
    const handleStatus = (key: string, value: string | boolean) => {
        setStatus({ ...properties, [key]: value });
    };

    function closeDialog() {
        setStatus({
            ...properties,
            isLoading: false,
            dialogIsOpen: false,
        });
        setData({
            key: '',
            value: '',
        });
    }

    function getEnv(appName: string) {
        axios
            .get(`${appName}/deta`, {
                auth: {
                    username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                    password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                },
            })
            .then((e) => {
                const data = Object.entries(e.data).map(([key, value]) => ({
                    key,
                    value: (value as any).toString(),
                }));
                console.log(data);
                setEnv(data);
            });
    }

    useEffect(() => {
        getEnv(properties.appName);
    }, [properties.appName]);

    const SubmitEnv = (method: 'update' | 'add' | 'delete') => {
        handleStatus('isLoading', true);
        delete data?.properties;
        let body;

        if (method === 'delete') body = { [data.key]: null };
        else
            body = {
                [data.key]:
                    data.value === 'true'
                        ? true
                        : data.value === 'false'
                        ? false
                        : data.value,
            };

        if (method === 'add' || method === 'update')
            axios
                .put(`${properties.appName}/deta`, body, {
                    auth: {
                        username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                        password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                    },
                })
                .then((e) => {
                    getEnv(properties.appName);
                    closeDialog();
                });
        else
            axios
                .delete(`${properties.appName}/deta/${data.key}`, {
                    auth: {
                        username: process.env.REACT_APP_AUTH_USERNAME ?? '',
                        password: process.env.REACT_APP_AUTH_PASSWORD ?? '',
                    },
                })
                .then((e) => {
                    getEnv(properties.appName);
                    closeDialog();
                });
    };

    const UpdateEnv = (env: any) => {
        handleStatus('dialogIsOpen', true);
        setData({
            ...env,
            properties: { isUpdate: true },
        });
    };

    const columns = [
        {
            id: 'key',
            label: 'Key',
            minWidth: 170,
        },
        {
            id: 'value',
            label: 'Value',
            minWidth: 100,
        },
    ];

    return (
        <div className="m-10">
            <Button
                variant="contained"
                className="mb-10"
                startIcon={<Plus />}
                onClick={() => handleStatus('dialogIsOpen', true)}
            >
                Add Variable
            </Button>

            <FormControl fullWidth className="mt-10 mb-10">
                <InputLabel id="app-name">App Name</InputLabel>
                <Select
                    id="app-name"
                    label="App Name"
                    labelId="app-name"
                    value={properties.appName}
                    onChange={(e: SelectChangeEvent) =>
                        handleStatus('appName', String(e.target.value))
                    }
                >
                    {process.env.REACT_APP_ENV_URL?.split(',').map(
                        (appName: string) => (
                            <MenuItem key={appName} value={appName}>
                                {appName}
                            </MenuItem>
                        )
                    )}
                </Select>
            </FormControl>

            <TableContainer>
                <Table className="card">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align="left"
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {env && env?.length > 0 ? (
                            env
                                .slice(
                                    page * rowPerPage,
                                    page * rowPerPage + rowPerPage
                                )
                                .map((song: any, index: number) => {
                                    return (
                                        <TableRow
                                            hover
                                            key={index}
                                            onClick={() => UpdateEnv(song)}
                                        >
                                            {columns.map((column) => {
                                                return (
                                                    <TableCell key={column.id}>
                                                        {song[column.id]}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <LinearProgress />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                className="card"
                component="div"
                count={env.length ?? 0}
                rowsPerPage={rowPerPage}
                page={page}
                onPageChange={(_, newPage) => {
                    setPage(newPage);
                }}
                onRowsPerPageChange={(e) => {
                    setPage(0);
                    setRowPerPage(+e.target.value);
                }}
            />

            <Dialog
                fullWidth
                open={properties.dialogIsOpen}
                onClose={() => closeDialog()}
            >
                <DialogTitle className="error">
                    {data?.properties?.isUpdate ? 'Edit' : 'Add'} Environment
                    Variable
                </DialogTitle>
                <DialogContent>
                    {Object.keys(columns).map((_, index: number) => {
                        const { id, label } = columns[index];
                        return (
                            <TextField
                                id={id}
                                required
                                fullWidth
                                key={index}
                                type="text"
                                label={label}
                                margin="dense"
                                variant="standard"
                                multiline={id === 'value'}
                                value={data[id].replace(/\\n/g, '\n')}
                                disabled={
                                    data?.properties?.isUpdate && id === 'key'
                                }
                                onChange={(e) => {
                                    !data?.properties?.isUpdate
                                        ? handleData(id, e.target.value)
                                        : id !== 'key' &&
                                          handleData(id, e.target.value);
                                }}
                            />
                        );
                    })}
                </DialogContent>
                <DialogActions>
                    {data?.properties?.isUpdate ? (
                        <Button
                            color="error"
                            onDoubleClick={() => SubmitEnv('delete')}
                        >
                            Delete
                        </Button>
                    ) : null}
                    <Button color="inherit" onClick={() => closeDialog()}>
                        Cancel
                    </Button>
                    <Button
                        disabled={properties.isLoading}
                        onClick={() =>
                            SubmitEnv(
                                data?.properties?.isUpdate === true
                                    ? 'update'
                                    : 'add'
                            )
                        }
                    >
                        {data?.properties?.isUpdate === true ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Environment;
