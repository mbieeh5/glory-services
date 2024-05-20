/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref,  } from "@firebase/database";
import styled from "styled-components";
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import Cookies from "js-cookie";

interface DataRes {
    NoNota: string;
    NamaUser: string;
    NoHpUser: string;
    TglMasuk: string;
    TglKeluar: string;
    MerkHp: string;
    Kerusakan: string;
    Penerima: string;
    Harga: number;
    Teknisi: string;
    status: string;
}

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    
    const loadNextFiveItems = () => {
        setStartIndex(prevIndex => prevIndex + 5);
    };
    
    const loadPreviousFiveItems = () => {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 5));
    };

    const dateFormater = (date:string) => {
        const TglObj = new Date(date);
        const tgl = TglObj.getDate();
        const bln = TglObj.getMonth() + 1;
        const thn = TglObj.getFullYear();
        const jam = TglObj.getHours();
        const mnt = TglObj.getMinutes();
        const tanggalWaktuBaru = ("0" + tgl).slice(-2) + "/" + ("0" + bln).slice(-2) + "/" + thn + " @" + ("0" + jam).slice(-2) + ":" + ("0" + mnt).slice(-2);
        if(!isNaN(tgl)){
            return tanggalWaktuBaru
        }else{
            return 'Belum Di Ambil'
        }
    }

    useEffect(() => {
    const Auth:any = Cookies.get('_IDs')

        if(!Auth){
            alert('You Not Supposed to here before login ?')
            window.location.reload();
        }

        const DB = ref(getDatabase());
        get(child(DB, "Service/sandboxDS")).then(async(datas) => {
            const Data = datas.val() || {};
            const Array:DataRes[] = Object.values(Data);
            setDataResi(Array);
        }).catch((err) => {
            console.error(err);
        })
    },[])

    return(
        <MainWrapper>
            <BasicSection2 title="Data Service yang kamu Terima Hari ini">
                    <Wrapper>
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
                                    <TableHeader>Estimasi Harga</TableHeader>
                                    <TableHeader>Teknisi</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </TableRow>
                             </thead>
                        {DataResi.slice(startIndex, startIndex + 5).map((a, i) => (
                                <tbody key={i}>
                                    <TableRow>
                                        <TableData>{a.NoNota}</TableData>
                                        <TableData>{a.NamaUser}</TableData>
                                        <TableData>{a.NoHpUser}</TableData>
                                        <TableData>{dateFormater(a.TglMasuk)}</TableData>
                                        <TableData>{dateFormater(a.TglKeluar)}</TableData>
                                        <TableData>{a.MerkHp}</TableData>
                                        <TableData>{a.Kerusakan}</TableData>
                                        <TableData>{a.Penerima}</TableData>
                                        <TableData>{a.Harga.toLocaleString()}</TableData>
                                        <TableData>{a.Teknisi || a.status}</TableData>
                                        <TableData>{a.status}</TableData>                                     
                                    </TableRow>
                                </tbody>
                        ))}
                    </Table>
            </Wrapper>
                    <Buttons2 onClick={loadPreviousFiveItems}>Sebelumnya</Buttons2>
                    <Buttons2 onClick={loadNextFiveItems}>Selanjutnya</Buttons2>
            </BasicSection2>
        </MainWrapper>
    )
}

const MainWrapper = styled.div`
margin-top: 3rem;
`

const Wrapper = styled.div`
overflow-x: auto;
align-items: center;
max-width: 100%;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  background-color: #4caf50;
  color: rgb(0,0,0);
  `;
  
  const TableData = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
  color: rgb(var(--text));
`;


const Buttons2 = styled(Button)`
padding: 1rem;
margin-top: 2rem;
width: 15rem;
height: 7rem;
margin-left: 2rem;
font-size: 100%;
`