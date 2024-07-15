/* eslint-disable import/order */
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import React, { useState } from "react";
import styled from "styled-components";


export default function Laporan() {
    const [startIndex, setStartIndex] = useState(0);
    const recentServiceData:any = [];
    const loadNextFiveItems = () => {
        setStartIndex(prevIndex => prevIndex + 5);
    };
    const loadPreviousFiveItems = () => {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 5));
    };


    return(
        <>
                        <BasicSection2 title="">
                                    <TableWrapper>
                                        <div>Total Service Total : {recentServiceData.length}</div>
                                        <Table>
                                            <thead>
                                            <TableRow>
                                                <TableHeader>No Nota</TableHeader>
                                                <TableHeader>Nama user</TableHeader>
                                                <TableHeader>Nomor HP User</TableHeader>
                                                <TableHeader>Tanggal Masuk</TableHeader>
                                                <TableHeader>Tanggal Keluar</TableHeader>
                                                <TableHeader>Merk HP</TableHeader>
                                                <TableHeader>Kerusakan</TableHeader>
                                                <TableHeader>Penerima</TableHeader>
                                                <TableHeader>Harga</TableHeader>
                                                <TableHeader>Harga Ibnu</TableHeader>
                                                <TableHeader>Lokasi</TableHeader>
                                                <TableHeader>Teknisi</TableHeader>
                                                <TableHeader>Status</TableHeader>
                                            </TableRow>
                                            </thead>
                            {recentServiceData.slice(startIndex, startIndex + 5).map((a:any, i:any) => {
                                const formatDate = (dateString:any) => {
                                    const date = new Date(dateString);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
                                    const year = date.getFullYear();
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                
                                    return `${day}/${month}/${year} @${hours}:${minutes}`;
                                }
                                return (
                                        <tbody key={i}>
                                            <TableRow>
                                                <TableData>{a.NoNota}</TableData>
                                                <TableData>{a.NamaUser}</TableData>
                                                <TableData>{a.NoHpUser}</TableData>
                                                <TableData>{formatDate(a.TglMasuk)}</TableData>
                                                <TableData>{a.TglKeluar ? formatDate(a.TglKeluar) : 'Belum Di Ambil'}</TableData>
                                                <TableData>{a.MerkHp}</TableData>
                                                <TableData>{a.Kerusakan}</TableData>
                                                <TableData>{a.Penerima}</TableData>
                                                <TableData>{a.Harga.toLocaleString('id')}</TableData>
                                                <TableData>{a.HargaIbnu? a.HargaIbnu.toLocaleString('id') : 0}</TableData>
                                                <TableData>{a.Lokasi}</TableData>
                                                <TableData>{a.Teknisi}</TableData>
                                                <TableData>{a.status}</TableData>
                                            </TableRow>
                                        </tbody>
                                        )
                            })}
                            </Table>
                        </TableWrapper>
                            <Buttons2 onClick={loadPreviousFiveItems}>Previous</Buttons2>
                            <Buttons2 onClick={loadNextFiveItems}>Next</Buttons2>
                        </BasicSection2>
        </>
    )
}


const TableWrapper = styled.div` 
overflow-x: auto;
align-items: center;
max-width: 100%;
`

const Table = styled.table`
max-width: 80%;
  border-collapse: collapse;
  table-layout: auto;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  width: 25rem;
  background-color: #4caf50;
  color: rgb(0,0,0);
  `;
  
  const TableData = styled.td`
  padding: 2rem;
  max-width: 100%;
  border-bottom: 1px solid #ddd;
  color: rgb(var(--text));
  white-space: nowrap;
  word-wrap: break-word;
`;

const Buttons2 = styled(Button)`
padding: 1rem;
margin-top: 2rem;
width: 15rem;
height: 7rem;
margin-left: 2rem;
font-size: 100%;
`