import { onValue, ref, set, remove, update } from '@firebase/database';
import {
    Alert,
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
} from '@mui/material';
import {
    collection,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
} from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Close } from '../lib/icons.component';

const Music = ({ properties }: any) => {
    const [logs, setLogData] = useState<any>([]);
    const [status, setStatus] = useState<{
        isLoading: boolean;
        isError: boolean;
    }>({
        isLoading: false,
        isError: false,
    });
    const [page, setPage] = useState<number>(0);
    const [rowPerPage, setRowPerPage] = useState<number>(10);
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

    useEffect(() => {
        getDocs(
            query(
                collection(getFirestore(), 'logs/'),
                orderBy('timestamp', 'desc')
            )
        ).then((snapshot) => {
            const rawLogs: any = [];
            snapshot.docs.map((doc) => rawLogs.push(doc.data()));
            setLogData(rawLogs);
        });
    }, []);

    // const DeleteMusic = () => {
    //     setMusicDialogIsOpen(false);
    //     const id = musicData.properties.id + page * rowPerPage;
    //     remove(ref(getFirestore(), 'logs/' + id));
    // };

    const columns = [
        {
            id: 'error',
            label: 'Error',
            minWidth: 170,
        },
        {
            id: 'message',
            label: 'Description',
            minWidth: 100,
        },
        {
            id: 'timestamp',
            label: 'Timestamp',
            minWidth: 100,
        },
        {
            id: 'delete',
            label: '',
            width: 'auto',
        },
    ];

    return (
        <div className="m-10">
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
                        {logs && logs?.length > 0 ? (
                            logs
                                .slice(
                                    page * rowPerPage,
                                    page * rowPerPage + rowPerPage
                                )
                                .map((song: any, index: number) => {
                                    return (
                                        <TableRow hover key={index}>
                                            {columns.map((column) => {
                                                return (
                                                    <TableCell key={column.id}>
                                                        {column.id ===
                                                        'timestamp' ? (
                                                            new Date(
                                                                song.timestamp
                                                                    .seconds *
                                                                    1000
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    weekday:
                                                                        'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    hour: 'numeric',
                                                                    minute: 'numeric',
                                                                    second: 'numeric',
                                                                }
                                                            )
                                                        ) : column.id ===
                                                          'delete' ? (
                                                            <Button
                                                                onClick={() =>
                                                                    setDialogIsOpen(
                                                                        true
                                                                    )
                                                                }
                                                                variant="outlined"
                                                            >
                                                                <Close />
                                                            </Button>
                                                        ) : (
                                                            song[column.id]
                                                        )}
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
                count={logs.length ?? 0}
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
                open={dialogIsOpen}
                onClose={() => setDialogIsOpen(false)}
            >
                <DialogTitle className="error">
                    Delete Log Permanently
                </DialogTitle>
                <DialogContent>
                    Are you sure want to delete this invoice permanently? This
                    action is <span className="error">irreversible</span>.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="error" onClick={() => console.log('hi')}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Music;
