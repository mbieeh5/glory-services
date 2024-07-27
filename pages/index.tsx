/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref } from "@firebase/database";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import Cookies from "js-cookie";
import { getAuth } from "firebase/auth";
import Button from "components/Button";
import Link from "next/link";
interface DataRes {
    NoNota: string;
    NamaUser: string;
    NoHpUser: string;
    TglMasuk: string;
    TglKeluar: string;
    MerkHp: string;
    Kerusakan: string;
    Penerima: string;
    Harga: any;
    HargaIbnu: any;
    Teknisi: string;
    Lokasi: string;
    status: string;
}

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFinish, setIsFinish] = useState<string>('null');
    const [teknisiSelected, setTeknisiSelected] = useState('');
    const [penerimaSelected, setPenerimaSelected] = useState('');
    const [lokasiSelected, setLokasiSelected] = useState('');
    const [statusSelected, setStatusSelected] = useState('');
    const [tglMskAwal, setTglMskAwal] = useState<string>('');
    const [tglMskAkhir, setTglMskAkhir] = useState<string>('');

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

    const TanggalMasukComponent = () => {
        return (
        <Splitter2>
            <Label> Tanggal Awal
                <Input type="date" value={tglMskAwal} onChange={(e) => {setTglMskAwal(e.target.value)}}/>
            </Label>
            <br />
            <Label> Tanggal Akhir
                <Input type="date" value={tglMskAkhir} onChange={(e) => {setTglMskAkhir(e.target.value)}}/>
            </Label> 
            <Button onClick={() => {filteredData()}}>Filter</Button>
        </Splitter2>
        )
    };

    const fetchData = () => {
        const authG:any = getAuth();
        const DB = ref(getDatabase());
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            const userRole = authG.currentUser.email.split('@')[0];
            const userName = authG.currentUser.email.split('@')[1].replace('.com', '');
            if(userRole === 'user'){
                setIsAdmin(false);
                get(child(DB, "Service/sandboxDS")).then(async(datas) => {
                    const Data = datas.val() || {};
                    const Array:DataRes[] = Object.values(Data);
                    const PendingData = Array.filter(item => 
                        item.Penerima.toLocaleLowerCase() === userName.toLocaleLowerCase() && 
                        (item.TglKeluar === 'null' || item.TglKeluar === undefined)                    
                    );
                    const converter = PendingData.filter(items => items.status === "sudah diambil" ? items.status = 'sukses' : items.status)
                        if(converter.length > 0){
                            setIsFinish('Yang Belum Selesai')
                            return setDataResi(converter); 
                        }
                        else{
                            return setIsFinish('Mu Sudah Selesai')
                        }
                }).catch((err) => {
                    console.error(err);
                })
            }else if(userRole === 'admin'){
                setIsAdmin(true);
                get(child(DB, "Service/sandboxDS")).then(async(datas) => {
                    const Data = datas.val() || {};
                    const Array:DataRes[] = Object.values(Data).map((item: any) => {
                        if(item.status === 'sudah diambil'){
                            item.status = 'sukses'
                        }
                        return item;
                    });
                    const sortedArray = Array.sort((a, b) => {
                        const dateA:any = new Date(a.TglMasuk);
                        const dateB:any = new Date(b.TglMasuk);
                        return dateB - dateA;
                    })
                    return setDataResi(sortedArray);
                }).catch((err) => {
                    console.error(err);
                })
            }else if(userRole === 'mod'){
                setIsAdmin(false);
                get(child(DB, "Service/sandboxDS"))
                .then(async(ss) => {
                    if(ss.exists()){
                        const datas = ss.val() || {};
                        const Array:DataRes[] = Object.values(datas);
                        const PendingData = Array.filter(items => 
                            (items.status === 'process' || items.status === 'sudah diambil') &&
                             (items.TglKeluar === undefined || items.TglKeluar === 'null')
                        );
                        const converter = PendingData.filter(items => items.status === "sudah diambil" ? items.status = 'sukses' : items.status)
                        if(PendingData.length > 0){
                            const sortedData = converter.sort((a, b) => {
                                const dateA:any = new Date(a.TglMasuk);
                                const dateB:any = new Date(b.TglMasuk);
                                return dateB - dateA ;
                            });
                            setIsFinish('Yang Belum Selesai')
                            return setDataResi(sortedData); 
                        }
                        else{
                            return setIsFinish('Mu Sudah Selesai')
                        }

                    }
                })
            }
        },3000)

    };

    const filteredData = () => {
        setIsLoading(true)
        setDataResi([]);
        setTimeout(() => {
            const DB = ref(getDatabase());
                get(child(DB, `Service/sandboxDS`))
                .then(async (ss) => {
                    const dataSS = ss.val() || {};
                    const Array:DataRes[] = Object.values(dataSS);
                    if (tglMskAwal && tglMskAkhir) {
                        const filterData = Array.filter(items => {
                            const masukAwal = new Date(tglMskAwal).setHours(0, 0, 0, 0);
                            const masukAkhir = new Date(tglMskAkhir).setHours(23, 59, 59, 999);
                            const tglMasuk = new Date(items.TglMasuk).setHours(0, 0, 0, 0);
                            const isTanggalMasukValid = tglMasuk >= masukAwal && tglMasuk <= masukAkhir;
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                            return isTanggalMasukValid && isTeknisiValid && isPenerimaValid && isStatusValid;
                        });
                        const sorterData = filterData.sort((a, b) => {
                            const dateA:any = new Date(a.TglMasuk);
                            const dateB:any = new Date(b.TglMasuk);
                            return dateA - dateB;
                        });
                        const converter = sorterData.map((item:any) => {
                            if(item.status === 'sudah diambil'){
                                item.status = 'sukses';
                            }
                            return item
                        });
                        setDataResi(converter);
                    } else {
                        const filterData = Array.filter(items => {
                            const tglMasuk = new Date(items.TglMasuk).setHours(0, 0, 0, 0);
                            const isTanggalMasukValid = (!tglMskAwal || tglMasuk >= new Date(tglMskAwal).setHours(0, 0, 0, 0)) && (!tglMskAkhir || tglMasuk <= new Date(tglMskAkhir).setHours(23, 59, 59, 999));
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                            const isLokasiValid = !lokasiSelected || items.Lokasi?.toLowerCase().includes(lokasiSelected.toLowerCase());
                            console.log({isLokasiValid, isStatusValid, isPenerimaValid, isTeknisiValid, isTanggalMasukValid});
                            return isTanggalMasukValid && isTeknisiValid && isPenerimaValid && isStatusValid && isLokasiValid;
                        });
                        const sorterData = filterData.sort((a, b) => {
                            const dateA:any = new Date(a.TglMasuk);
                            const dateB:any = new Date(b.TglMasuk);
                            return dateB - dateA;
                        });
                        const converter = sorterData.map((item:any) => {
                            if(item.status === 'sudah diambil'){
                                item.status = 'sukses';
                            }
                            return item;
                        });
                        setDataResi(converter);
                    }                    
                setIsLoading(false);
                }).catch((error) => {
                    console.error(error)
                    setIsLoading(false);
                })
        },1500)
    };
    
    useEffect(() => {
    const Auth:any = Cookies.get('_IDs')
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            return window.location.reload();
        }else{
            return fetchData();
        }
    },[])

    return(
        <MainWrapper>
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
                <Wrapper>
                        <Search>
                                <Splitter>
                                    <div>
                                        <LabelModal>Penerima:
                                            <SelectModal value={penerimaSelected} onChange={(e) => {setPenerimaSelected(e.target.value)}}>
                                                <option value="">Semua</option>
                                                <option value="reni">Reni</option>
                                                <option value="sindi">Sindi</option>
                                                <option value="tiara">Tiara</option>
                                                <option value="vina">Vina</option>
                                                <option value="yuniska">Yuniska</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                    <div>
                                        <LabelModal>Teknisi:
                                            <SelectModal value={teknisiSelected} onChange={(e) => {setTeknisiSelected(e.target.value)}}>
                                                <option value="">Semua</option>
                                                <option value="amri">Amri</option>
                                                <option value="ibnu">Ibnu</option>
                                                <option value="rafi">Rafi</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                    <div>
                                        <LabelModal> Lokasi:
                                            <SelectModal value={lokasiSelected} onChange={(e) => {setLokasiSelected(e.target.value)}}>
                                                <option value="">Semua</option>
                                                <option value="Cikaret">Cikaret</option>
                                                <option value="Sukahati">Sukahati</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                    <div>
                                        <LabelModal>Status:
                                            <SelectModal value={statusSelected} onChange={(e) => {setStatusSelected(e.target.value)}}>
                                                <option value="">Semua</option>
                                                <option value="cancel">Cancel</option>
                                                <option value="process">Process</option>
                                                <option value="sudah diambil">Sukses</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                </Splitter>
                                    <TanggalMasukComponent />
                                <Splitter2>
                                </Splitter2>
                                <ButtonWrapper>
                                    <Link href='/statistic'>
                                        <Button onClick={() => (null)}>Statistic</Button>
                                    </Link>
                                </ButtonWrapper>
                        </Search>
                </Wrapper>
            <BasicSection2 title="Data Service">
                    <Wrapper>
                        <p>Total Data : {DataResi.length}</p>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>No Nota</TableHeader>
                                    <TableHeader>Nama user</TableHeader>
                                    <TableHeader>Nomor HP User</TableHeader>
                                    <TableHeader>Tanggal Masuk</TableHeader>
                                    <TableHeader>Tanggal Keluar</TableHeader>
                                    <TableHeader>Merk HP</TableHeader>
                                    <TableHeader>Kerusakan</TableHeader>
                                    <TableHeader>Harga Ibnu</TableHeader>
                                    <TableHeader>Penerima</TableHeader>
                                    <TableHeader>Estimasi Harga</TableHeader>
                                    <TableHeader>Lokasi</TableHeader>
                                    <TableHeader>Teknisi</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </tr>
                             </thead>
                        {DataResi.map((a, i) => {
                            const ConvertNumber = (noHP:string) => {
                                if(noHP.startsWith('0')){
                                    return '62' + noHP.slice(1);
                                }
                                return noHP
                            }
                            const noHpConverter = ConvertNumber(a.NoHpUser);

                            return(
                                <tbody key={i}>
                                    <TableRow status={a.status} tglKeluar={a.TglKeluar}>
                                        <TableData>{a.NoNota}</TableData>
                                        <TableData>{a.NamaUser}</TableData>
                                        <TableData><TableDataA href={`https://wa.me/${noHpConverter}`} target="_blank">{a.NoHpUser}</TableDataA></TableData>
                                        <TableData>{dateFormater(a.TglMasuk)}</TableData>
                                        <TableData>{dateFormater(a.TglKeluar)}</TableData>
                                        <TableData>{a.MerkHp}</TableData>
                                        <TableData>{a.Kerusakan}</TableData>
                                        <TableData>{a.HargaIbnu ? parseInt(a.HargaIbnu).toLocaleString() : 0}</TableData>
                                        <TableData>{a.Penerima}</TableData>
                                        <TableData>{parseInt(a.Harga).toLocaleString()}</TableData>
                                        <TableData>{a.Lokasi}</TableData>
                                        <TableData>{a.Teknisi || a.status}</TableData>
                                        <TableData>{a.status}</TableData>                                     
                                    </TableRow>
                                </tbody>
                                )
                            })}
                    </Table>
            </Wrapper>
            </BasicSection2>
            </> : 
            <>
            <MainWrapper>
                <BasicSection2 title={`Service ${isFinish}`}>
                        <Wrapper>
                            <Table>
                                <thead>
                                    <tr>
                                        <TableHeader>No Nota</TableHeader>
                                        <TableHeader>Nama user</TableHeader>
                                        <TableHeader>Nomor HP User</TableHeader>
                                        <TableHeader>Tanggal Masuk</TableHeader>
                                        <TableHeader>Tanggal Keluar</TableHeader>
                                        <TableHeader>Merk HP</TableHeader>
                                        <TableHeader>Kerusakan</TableHeader>
                                        <TableHeader>Penerima</TableHeader>
                                        <TableHeader>Lokasi</TableHeader>
                                        <TableHeader>Estimasi Harga</TableHeader>
                                        <TableHeader>Teknisi</TableHeader>
                                        <TableHeader>Status</TableHeader>
                                    </tr>
                                </thead>
                            {DataResi.map((a, i) => {
                                const ConvertNumber = (noHP:string) => {
                                    if(noHP.startsWith('0')){
                                        return '62' + noHP.slice(1);
                                    }
                                    return noHP
                                }
                                const noHpConverter = ConvertNumber(a.NoHpUser);
                                    return (
                                    <tbody key={i}>
                                        <TableRow status={a.status} tglKeluar={a.TglKeluar}>
                                            <TableData>{a.NoNota}</TableData>
                                            <TableData>{a.NamaUser}</TableData>
                                            <TableData><TableDataA href={`https://wa.me/${noHpConverter}`} target="_blank">{a.NoHpUser}</TableDataA></TableData>
                                            <TableData>{dateFormater(a.TglMasuk)}</TableData>
                                            <TableData>{dateFormater(a.TglKeluar)}</TableData>
                                            <TableData>{a.MerkHp}</TableData>
                                            <TableData>{a.Kerusakan}</TableData>
                                            <TableData>{a.Penerima}</TableData>
                                            <TableData>{a.Lokasi}</TableData>
                                            <TableData>{a.Harga.toLocaleString()}</TableData>
                                            <TableData>{a.Teknisi || a.status}</TableData>
                                            <TableData>{a.status}</TableData>                                     
                                        </TableRow>
                                    </tbody>
                                    )
                                })}
                        </Table>
                </Wrapper>
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

const Wrapper = styled.div`
overflow-x: auto;
align-items: center;
max-width: 100%;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr<{status : string, tglKeluar: string}>`
    background-color: ${props => {
        if (props.status === 'sukses' && (props.tglKeluar === 'null' || props.tglKeluar === '')) {
            return 'cyan';
          }
          switch (props.status) {
            case 'sukses':
              return 'green';
            case 'cancel':
              return 'red';
            default:
              return 'yellow';
          }
        }};
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  background-color: blue;
  color: rgb(var(--textSecondary));
  `;
  
  const TableData = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
  color: black;
`;
  
  const TableDataA = styled.a`
  color: black;
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

const Splitter2 = styled.div` 
    display: flex;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    @media (max-width: 512px) {
        flex-direction: row;
    }
`

const Search = styled.div`

`
const Splitter = styled.div` 
    display: flex;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    @media (max-width: 512px) {
        flex-direction: column;
    }
`

const LabelModal = styled.label`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    align-items: center;
    text-align: center;'
`;

const SelectModal = styled.select`
width: 15rem;
background: rgb(var(--inputBackground));
color: rgb(var(--text));
text-align: center;
border-radius: 12px;
border: none;
padding-top: 1rem;
`

const Input = styled.input`
  border: 1px solid rgb(var(--inputBackground));
  background: rgb(var(--inputBackground));
  color: rgb(var(--text));
  border-radius: 0.6rem;
  max-width: 25rem;
  max-height: 2rem;
  text-align: center;
  font-size: 1.6rem;
  padding: 1.8rem;
  box-shadow: var(--shadow-md);

  &:focus {
    outline: none;
    box-shadow: var(--shadow-lg);
  }
`;
const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
    align-items: center;
`;

const ButtonWrapper = styled.div`
display: flex;
align-items:center;
justify-content: center;
`