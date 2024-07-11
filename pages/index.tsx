/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref } from "@firebase/database";
import styled, {keyframes} from "styled-components";
import NextLink from 'next/link';
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import Cookies from "js-cookie";
import { getAuth } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAsc, faSortDesc } from "@fortawesome/free-solid-svg-icons";

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
    Lokasi: string;
    status: string;
}

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFinish, setIsFinish] = useState<string>('null')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
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

    const sortedData = () => {
        	const sortedData = [...DataResi].sort((a, b) => {
                if(sortOrder === 'asc'){
                    return new Date(a.TglMasuk).getTime() - new Date(b.TglMasuk).getTime();
                }else {
                    return new Date(b.TglMasuk).getTime() - new Date(a.TglMasuk).getTime()
                }
            })
            setDataResi(sortedData);
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }

    useEffect(() => {
    const Auth:any = Cookies.get('_IDs')
    const authG:any = getAuth();
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            window.location.reload();
        }else{
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                const userRole = authG.currentUser.email.split('@')[0];
                const userName = authG.currentUser.email.split('@')[1].replace('.com', '');
                if(userRole === 'user'){
                    setIsAdmin(false);
                    const DB = ref(getDatabase());
                    get(child(DB, "Service/sandboxDS")).then(async(datas) => {
                        const Data = datas.val() || {};
                        const Array:DataRes[] = Object.values(Data);
                        const PendingData = Array.filter(item => 
                            item.status === 'process' && item.Penerima.toLocaleLowerCase() === userName
                        );
                        if(PendingData.length > 0){
                            setIsFinish('Yang Belum Selesai')
                            setDataResi(PendingData); 
                        }
                        else{
                            setIsFinish('Mu Sudah Selesai')
                        }
                    }).catch((err) => {
                        console.error(err);
                    })
                }else if(userRole === 'admin'){
                    setIsAdmin(true);
                    const DB = ref(getDatabase());
                    get(child(DB, "Service/sandboxDS")).then(async(datas) => {
                        const Data = datas.val() || {};
                        const Array:DataRes[] = Object.values(Data);
                        setDataResi(Array);
                    }).catch((err) => {
                        console.error(err);
                    })
                }else{
                    setIsAdmin(false);
                    
                }
            },3000)
            }
    },[])

    return(
        <MainWrapper>
            <WrapperAtas>
                    <NextLink href="/input-data" passHref>
                        <Hrefing >Input Data Service</Hrefing>
                    </NextLink>
                    <NextLink href="/update-resi" passHref>
                        <Hrefing >Update Data Service</Hrefing>
                    </NextLink>
                    <NextLink href='/settings' passHref>
                        <Hrefing>Pengaturan</Hrefing>
                    </NextLink>
            </WrapperAtas>
        <Divider />

        <>
            {isLoading ? 
            <>
            <Wrapper>
                <WrapperLoading>
                        <Spinner />
                </WrapperLoading>
            </Wrapper>
            </> : <>
            {isAdmin ? 
            <>
            <BasicSection2 title="Data Service Hari ini">
                    <Wrapper>
                        <Table>
                            <thead>
                                <TableRow>
                                    <TableHeader>No Nota</TableHeader>
                                    <TableHeader>Nama user</TableHeader>
                                    <TableHeader>Nomor HP User</TableHeader>
                                    <TableHeader>
                                        <Button onClick={sortedData} transparent>
                                            Tanggal Masuk
                                            <FontAwesomeIcon icon={sortOrder === 'asc' ? faSortAsc : faSortDesc}/>
                                        </Button>
                                    </TableHeader>
                                    <TableHeader>Tanggal Keluar</TableHeader>
                                    <TableHeader>Merk HP</TableHeader>
                                    <TableHeader>Kerusakan</TableHeader>
                                    <TableHeader>Penerima</TableHeader>
                                    <TableHeader>Estimasi Harga</TableHeader>
                                    <TableHeader>Lokasi</TableHeader>
                                    <TableHeader>Teknisi</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </TableRow>
                             </thead>
                        {DataResi.slice(startIndex, startIndex + 5).map((a, i) => {
                            const ConvertNumber = (noHP:string) => {
                                if(noHP.startsWith('0')){
                                    return '62' + noHP.slice(1);
                                }
                                return noHP
                            }
                            const noHpConverter = ConvertNumber(a.NoHpUser);

                            return(
                                <tbody key={i}>
                                    <TableRow>
                                        <TableData>{a.NoNota}</TableData>
                                        <TableData>{a.NamaUser}</TableData>
                                        <TableData><TableDataA href={`https://wa.me/${noHpConverter}`} target="_blank">{a.NoHpUser}</TableDataA></TableData>
                                        <TableData>{dateFormater(a.TglMasuk)}</TableData>
                                        <TableData>{dateFormater(a.TglKeluar)}</TableData>
                                        <TableData>{a.MerkHp}</TableData>
                                        <TableData>{a.Kerusakan}</TableData>
                                        <TableData>{a.Penerima}</TableData>
                                        <TableData>{a.Harga.toLocaleString()}</TableData>
                                        <TableData>{a.Lokasi}</TableData>
                                        <TableData>{a.Teknisi || a.status}</TableData>
                                        <TableData>{a.status}</TableData>                                     
                                    </TableRow>
                                </tbody>
                                )
                            })}
                    </Table>
            </Wrapper>
                    <Buttons2 onClick={loadPreviousFiveItems}>Sebelumnya</Buttons2>
                    <Buttons2 onClick={loadNextFiveItems}>Selanjutnya</Buttons2>
            </BasicSection2>
            </> : 
            <>
            <MainWrapper>
                <BasicSection2 title={`Service ${isFinish}`}>
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
            </>}
            </>}        
        </>
            </MainWrapper>
        )
    }

const MainWrapper = styled.div`
margin-top: 3rem;
`


const Hrefing = styled.a`
  display: inline-block;
  padding: 1rem 2rem;
  margin: 2rem;
  font-size: 1.5rem;
  color: #fff;
  background-color: #007bff;
  text-decoration: none;
  border-radius: 12px;
  transition: background-color 0.3s, color 0.3s, transform 0.3s;
  text-align: center;

  &:hover {
    background-color: #0056b3;
    color: #e0e0e0;
    transform: translateY(-3px);
  }

  &:active {
    background-color: #004085;
    color: #d0d0d0;
    transform: translateY(-1px);
  }
`;

const WrapperAtas = styled.div`
display: absolute;
text-align: center;

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
  
  const TableDataA = styled.a`
  color: rgb(var(--text));
  `

const Buttons2 = styled(Button)`
padding: 1rem;
margin-top: 2rem;
width: 15rem;
height: 7rem;
margin-left: 2rem;
font-size: 100%;
`


const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const WrapperLoading = styled.div`
display: flex;
justify-content: center;
align-items: center;
height: 100%;
width: 100%;
position: fixed;
top: 0;
left: 0;
background-color: rgba(255, 255, 255, 0.8);
`

const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: rgb(var(--text));
    margin-top: 1rem;
`;