/* eslint-disable import/order */
import { child, get, getDatabase, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import { getAuth } from "firebase/auth";
import ButtonGroup from "components/ButtonGroup";

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
    Lokasi: string;
    Teknisi: string;
    HargaIbnu: number;
    status: string;
}

export default function UpdateResi() {
    const [noNotaSearch, setNoNotaSearch] = useState("");
    const [cekNotaSearch, setCekNotaSearch] = useState<DataRes[]>([]);
    const [isLoading, setIsloading] = useState<Boolean>(false);
    const [recentServiceData, setRecentServiceData] = useState<DataRes[]>([]);
    const [isSearch, setIsSearch] = useState(false);
    const [isCekNota, setIsCekNota] = useState<Boolean>(false);
    const [serviceDataToEdit, setServiceDataToEdit] = useState<DataRes[]>([]);
    const [isError, setIsError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState<Boolean>(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [cekNota, setCekNota] = useState<string>('')
    const [isIbnu, setIsIbnu] = useState<Boolean>(false);
    const [isTeknisiUpdate, setIsTeknisiUpdate] = useState<string>("")
    const [isAdmin, setIsAdmin] = useState<Boolean>(false);
    const [isKerusakan, setIsKerusakan] = useState<string>("")
    const [isNoHpUser, setIsNoHpUser] = useState<string>("");
    const [isTanggalSelected, setIsTanggalSelected] = useState<Boolean>(false);
    const [isTanggalMasuk, setIsTanggalMasuk] = useState<Boolean>(false);
    const [tanggalDipilih, setTanggalDipilih] = useState<string>('');
    const [teknisiSelected, setTeknisiSelected] = useState('');
    const [penerimaSelected, setPenerimaSelected] = useState('');
    const [statusSelected, setStatusSelected] = useState('');
    const [tglMskAwal, setTglMskAwal] = useState<string>('');
    const [tglMskAkhir, setTglMskAkhir] = useState<string>('');
    const [tglKluarAwal, setTglKluarAwal] = useState<string>('');
    const [tglKluarAkhir, setTglKluarAkhir] = useState<string>('');
    const fakeKey = 1;
    
    const IbnuController = (e:string) => {
        
        if(e.toLowerCase() === 'ibnu'){
            setIsIbnu(true)
        }else{
            setIsIbnu(false)
        }
        return setIsTeknisiUpdate(e);
    };
    const isSearchService = () => {
        setIsSearch(true)
        if (!noNotaSearch) {
            setIsError("Silahkan Masukan Nomor Nota");
            setIsSearch(false);
        } else {
            const DB = ref(getDatabase());
            get(child(DB, `Service/sandboxDS/${noNotaSearch}`))
            .then(async (data) => {
                if(data.exists()){
                    setIsloading(true)
                    setTimeout(() => {
                            setIsloading(false)
                            const Data = data.val() || {};
                            setIsKerusakan(Data.Kerusakan);
                            setIsNoHpUser(Data.NoHpUser);
                            const Array:DataRes[] = Object.values({Data});
                            setServiceDataToEdit(Array);
                            setIsError("");
                            setRecentServiceData([]);
                            const statusBool = Data.status;
                            if(statusBool === 'process'){
                                setButtonDisabled(false);
                            }else{
                                setButtonDisabled(true);
                            }
                        },1000)
                    }else{
                        setIsloading(true)
                        setTimeout(() => {
                            setIsloading(false)
                            setIsError("Nomor Nota Tidak Di Temukan");
                            setIsSearch(false);
                        },1000)
                    }
                })
                .catch((error) => {
                    console.error("Error fetching resi data:", error);
                    setIsError("Terjadi kesalahan saat mencari resi");
                });
            }
    };
    const handleChangeNoHp = (e:string) => { 
        if(e.length > 0){
            return setIsNoHpUser(e);
        }
        return e;
    };
    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target) || "Null";
        const DB = ref(getDatabase());
        const NoNota = formData.get('noNota')?.toString() || "null";
        const TglMasuk = formData.get('tanggalMasuk')?.toString() || "null";  
        const TglKeluar = formData.get('tanggalKeluar')?.toString() || "null";  
        const NamaUser = formData.get('namaUser')?.toString() || "null";
        const Penerima = formData.get('penerima')?.toString() || "null";
        const NoHpUser = formData.get('noHpUser')?.toString() || "null";
        const MerkHp = formData.get('merkHp')?.toString() || "null";
        const HargaIbnu = formData.get('hargaIbnu')?.toString() || "0"
        const Kerusakan = formData.get('kerusakan')?.toString() || "null";
        const Lokasi = formData.get('lokasi')?.toString() || "null";
        const Harga = formData.get('hargaAkhir')?.toString() || "null";
        const Teknisi = formData.get('teknisi')?.toString() || "null";
        const status = formData.get('status')?.toString() || "null";

            const newData = {
                [NoNota] : {
                    NoNota,
                    NamaUser,
                    TglMasuk,
                    TglKeluar,
                    NoHpUser,
                    MerkHp,
                    Penerima, 
                    Kerusakan, 
                    Harga,
                    Lokasi,
                    Teknisi,
                    HargaIbnu,
                    status
                }
            };
          const notaRef = ref(getDatabase(), `Service/sandboxDS/`);
            update(notaRef, newData)
            .then(() => {
                alert('Resi Berhasil di Update')
                e.target.reset();
                window.location.reload();
                get(child(DB, `Users/dataPenerima/${Penerima}`)).then(async(datas) => {
                    const exsist = datas.val() || {};
                    const points = exsist.point || 0;
                    const units = exsist.unit || 0;
                        const pts = points + 5000
                        const unit = units + 1;
                            const pointData = {
                                [Penerima] : {
                                    nama: Penerima,
                                    point: pts,
                                    unit: unit,
                                }
                            }
                            if(status === 'sudah diambil'){
                                const pointRef = ref(getDatabase(), `Users/dataPenerima/`);
                                update(pointRef, pointData)
                            }
                    }).catch((err) => {
                        console.error(err);
                    });
            })
            .catch((error) => {
                console.error('Gagal menyimpan data:', error);
            });
    };
    const handleChange = (e:any) => {
    setIsKerusakan(e);
    };
    const handleSearchFilter1 = (i:string) => {
        const indexLowerCase = i.toLocaleLowerCase();
        if(indexLowerCase === ''){
            setIsError('silahkan masukan kata Kunci Terlebih dahulu');
        }else{
            const DB = ref(getDatabase());
            get(child(DB, `Service/sandboxDS`))
            .then(async (snapshot) => {
                    const Data = snapshot.val() || {};
                    const Array:DataRes[] = Object.values(Data);
                    const filterData = Array.filter(items => 
                        items.NoNota.toLowerCase().includes(indexLowerCase) ||
                        items.NamaUser.toLowerCase().includes(indexLowerCase) ||
                        items.MerkHp.toLowerCase().includes(indexLowerCase) ||
                        items.Kerusakan.toLowerCase().includes(indexLowerCase) ||
                        items.Penerima.toLowerCase().includes(indexLowerCase) ||
                        items.status.toLowerCase().includes(indexLowerCase) ||
                        items.Teknisi?.toLowerCase().includes(indexLowerCase) ||
                        items.Lokasi.toLowerCase().includes(indexLowerCase)
                    )
                    setRecentServiceData(filterData);
                    setIsError("");
                })
                .catch((error) => {
                    console.error("Error fetching recent resi data:", error);
                    setIsError("Terjadi kesalahan saat mengambil data resi terbaru");
                });
        }
    };
    const handlOnChangeTanggalFilter = (e:any) => {
        const value:string = e.target.value;
        setTanggalDipilih(value);
        if(value === 'tanggalMasuk'){
                setIsTanggalSelected(true);
                setIsTanggalMasuk(true);
        }else if(value === 'tanggalKeluar'){
                setIsTanggalSelected(true);
                setIsTanggalMasuk(false);
        }else if(value === 'semua'){
            return setIsTanggalSelected(false);
        }else {
            return setIsTanggalSelected(false)
        }
    };
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
        </Splitter2>
        )
    };
    const TanggalKeluarComponent = () => {
        return (
        <div>
            <Label> Tanggal Awal
                <Input type="date" value={tglKluarAwal} onChange={(e) => {setTglKluarAwal(e.target.value)}}/>
            </Label> 
            <Label> Tanggal Akhir
                <Input type="date" value={tglKluarAkhir} onChange={(e) => {setTglKluarAkhir(e.target.value)}}/>
            </Label> 
        </div>
        )
    };
    const closePopUpModalFilter = () => {
        setIsModalOpen(false);
    };
    const fetchData = () => {
        setTimeout(() => {
            setIsloading(false);
            const DB = ref(getDatabase());
            const AuthG:any = getAuth();
            const role = AuthG.currentUser.email.split('@')[0];
            if(role === 'admin'){
                setIsAdmin(true);
                get(child(DB, `Service/sandboxDS`))
                .then(async (snapshot) => {
                    const Data = snapshot.val() || {};
                    const Array:DataRes[] = Object.values(Data);
                    const filteredData = Array.sort((a, b) => {
                        const DateA:any = new Date(a.TglMasuk);
                        const DateB:any = new Date(b.TglMasuk);
                        return DateB - DateA;
                    })
                    setRecentServiceData(filteredData);
                    setIsError("");
                })
                .catch((error) => {
                    console.error("Error fetching recent resi data:", error);
                    setIsError("Terjadi kesalahan saat mengambil data resi terbaru");
                });
            }
        },1500)
    };
    const filteredData = () => {
        setIsloading(true)
        setRecentServiceData([]);
        setTimeout(() => {
            closePopUpModalFilter();
            const DB = ref(getDatabase());
                get(child(DB, `Service/sandboxDS`))
                .then(async (ss) => {
                    const dataSS = ss.val() || {};
                    const Array:DataRes[] = Object.values(dataSS);
                    if(tanggalDipilih === 'tanggalMasuk'){
                    const filterData = Array.filter(items => {
                        const masukAwal = tglMskAwal ? new Date(tglMskAwal).setHours(0, 0, 0, 0) : null;
                        const masukAkhir = tglMskAkhir ? new Date(tglMskAkhir).setHours(23, 59, 59, 999) : null;
                        const tglMasuk = new Date(items.TglMasuk).setHours(0, 0, 0, 0);
                        const isTanggalMasukValid = (!masukAwal || tglMasuk >= masukAwal) && (!masukAkhir || tglMasuk <= masukAkhir);
                        const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                        const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                        const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                        return isTanggalMasukValid && isTeknisiValid && isPenerimaValid && isStatusValid;
                    });
                    const sorterData = filterData.sort((a, b) => {
                        const dateA:any = new Date(a.TglMasuk);
                        const dateB:any = new Date(b.TglMasuk);
                        return dateA - dateB;
                    })
                    setRecentServiceData(sorterData);
                }else if(tanggalDipilih === 'tanggalKeluar'){
                const filterData = Array.filter(items => {
                    const keluarAwal = tglMskAwal ? new Date(tglMskAwal).setHours(0, 0, 0, 0) : null;
                    const keluarAkhir = tglMskAkhir ? new Date(tglMskAkhir).setHours(23, 59, 59, 999) : null;
                    const tglKeluar = new Date(items.TglMasuk).setHours(0, 0, 0, 0);
                    const isTanggalKeluarValid = (!keluarAwal || tglKeluar >= keluarAwal) && (!keluarAkhir || tglKeluar <= keluarAkhir);
                    const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                    const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                    const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                    return isTanggalKeluarValid && isTeknisiValid && isPenerimaValid && isStatusValid;
                });
                const sorterData = filterData.sort((a, b) => {
                    const dateA:any = new Date(a.TglMasuk);
                    const dateB:any = new Date(b.TglMasuk);
                    return dateA - dateB;
                })
                setRecentServiceData(sorterData);
                }else{
                    const filterData = Array.filter(items => {
                    const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                    const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                    const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                    return isTeknisiValid && isPenerimaValid && isStatusValid;
                });
                const sorterData = filterData.sort((a, b) => {
                    const dateA:any = new Date(a.TglMasuk);
                    const dateB:any = new Date(b.TglMasuk);
                    return dateB - dateA;
                })
                setRecentServiceData(sorterData);
                }
                setIsloading(false);
                }).catch((error) => {
                    console.error(error)
                    setIsloading(false);
                })
        },1500)
    };
    const SearchNota = () => {
        if(cekNota.length < 3){
            alert('HARAP ISI NO NOTA')
            setIsCekNota(false);
        }else{
            setIsloading(true);
            setTimeout(() => {
                const DB = ref(getDatabase());
                get(child(DB, `Service/sandboxDS/${cekNota}`))
                .then(async (ss) => {
                    if(ss.exists()){
                        const datas = ss.val() || {};
                        const Array:DataRes[] = Object.values({datas});
                        setCekNotaSearch(Array);
                    }else{
                        return alert('No Nota Tidak Di Temukan')
                    }
                    setIsCekNota(true);
                })
                setIsloading(false)
            },1500)
        }
    }
    useEffect(() => {
        setIsloading(true);
        fetchData();
    }, []);

    return (
        <Wrapper>
            {isLoading ? 
            <>
                <WrapperLoading>
                        <Spinner />
                </WrapperLoading>
            </> : 
            
            <>
            
            <SearchWrapper>
                <LabelSearch>
                    Cari Service:
                <Input type="text" placeholder="Cari Nomor Nota" onChange={(e) => setNoNotaSearch(e.target.value.toUpperCase())} />
                </LabelSearch>
                <ButtonSearch onClick={(isSearchService)}>Cari Service</ButtonSearch>
            </SearchWrapper>
            <ErrorText>{isError}</ErrorText>
            <Divider />
            <WrapperContent>
                {isSearch ? (
                    <BasicSection2 title="Update Data Service">
                <Wrapper2>
                    {serviceDataToEdit.map((a) => {
                        if(a.status === "sudah diambil"){
                                alert(`Status Service ${a.status} data tidak bisa di ubah!`)
                                return window.location.reload();
                            }else if(a.status === "cancel") {
                                alert(`Status Service ${a.status} data tidak bisa di ubah!`)
                                return window.location.reload();
                            }else {
                            return(
                        <FormCard key={fakeKey}>
                        <Form onSubmit={handleSubmit}>
                            <Splitter>
                            <Label>
                                No Nota:
                                <Input type="text" placeholder="Resi ID" value={a.NoNota} name="noNota" readOnly/>
                            </Label>
                            <Label>
                                Tanggal Masuk:
                                <Input type="datetime-local" placeholder="null" value={a.TglMasuk} name="tanggalMasuk" readOnly/>
                            </Label>
                            <Label>
                                Tanggal Keluar:
                                <Input type="datetime-local" placeholder="null" name="tanggalKeluar" required/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Nama User:
                                <Input type="text" value={a.NamaUser} name="namaUser" readOnly/>
                            </Label>
                            <Label>
                                No Hp User:
                                <Input type="text" value={isNoHpUser} onChange={(e) => {handleChangeNoHp(e.target.value)}} name="noHpUser" required/>
                            </Label>
                            <Label>
                                Penerima:
                                <Input type="text" value={a.Penerima} name="penerima" readOnly/>
                            </Label>
                            </Splitter>
                            <Splitter>
                            <Label>
                                Merk Hp:
                                <Input type="text" value={a.MerkHp} name="merkHp" readOnly/>
                            </Label>
                            <Label>
                                Kerusakan:
                                <Input type="text" placeholder="Kerusakannya apa" value={isKerusakan} onChange={(e) => {handleChange(e.target.value)}} name="kerusakan" required/>
                            </Label>
                            <Label>
                                Estimasi Harga:
                                <Input type="number" value={a.Harga} name="hargaAwal" readOnly/>
                            </Label>
                            </Splitter>
                            <Label>
                                Harga Akhir:
                                <Input type="number" placeholder="Masukan Harga Akhir" name="hargaAkhir" required/>
                            </Label>
                            <Splitter>
                            <Label>
                                Lokasi:
                                <Select placeholder="Lokasi Service"  name="lokasi" required>
                                    <option>{a.Lokasi}</option>
                                </Select>
                            </Label>
                            <Label>
                                Teknisi:
                                <Select placeholder="Kerjaan Siapa ?" value={isTeknisiUpdate} onChange={(e) => {IbnuController(e.target.value)}}  name="teknisi" required>
                                    <option>Amri</option>
                                    <option>Ibnu</option>
                                    <option>Rafi</option>
                                </Select>
                            </Label>
                            {isIbnu && 
                            <Label>
                                Harga Ibnu: 
                                <Input type="number" placeholder="Harga Ibnu Tanya Amri" name="hargaIbnu" required />
                            </Label>}
                            <Label>
                            Status:
                                <Select name='status' required>
                                <option>cancel</option>
                                <option>sudah diambil</option>
                                </Select>
                            </Label>
                            </Splitter>
                            <Splitter>
                            </Splitter>
                            <Splitter>
                                <ButtonGroup>
                                    <Buttons type="submit" disabled={buttonDisabled}>Update</Buttons>
                                </ButtonGroup>
                            </Splitter>
                    </Form>
                    </FormCard>
                        
                    )}
                })}
                </Wrapper2>
                    </BasicSection2>
                ) : (
                <>
                {isAdmin ? 
                <>
                    {recentServiceData && (
                        <BasicSection2 title="Recent Data Service">
                            <FilterWrapper>
                                <SearchWrapper>
                                    <Search>
                                        <Input placeholder="Masukan Kata Kunci" onChange={(e) => setSearchFilter(e.target.value)} />
                                            <ButtonSearch onClick={() => handleSearchFilter1(searchFilter)}>Cari</ButtonSearch>
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
                                                </Splitter>
                                                <Splitter>
                                                <div>
                                                    <LabelModal>Status:
                                                        <SelectModal value={statusSelected} onChange={(e) => {setStatusSelected(e.target.value)}}>
                                                            <option value="">Semua</option>
                                                            <option value="cancel">Cancel</option>
                                                            <option value="process">Process</option>
                                                            <option value="sudah diambil">Sudah Diambil</option>
                                                        </SelectModal>
                                                    </LabelModal>
                                                </div>
                                                </Splitter>
                                                <Splitter2>
                                                    <TanggalMasukComponent />
                                                </Splitter2>
                        <ButtonGroup>
                            <Button onClick={filteredData}>Filter Data</Button>
                        </ButtonGroup>
                                        </Search>
                                    </Search>
                                </SearchWrapper>
                            </FilterWrapper>
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
                            {recentServiceData.map((a, i) => {
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
                        </BasicSection2>
                    )}
                </> : 
                <>
                    <SearchWrapper>
                        <LabelSearch>
                            Cek Nota:
                            <Input type="text" placeholder="Masukan Nomor Nota" onChange={(e) => {setCekNota(e.target.value.toLocaleUpperCase())}}/>
                        </LabelSearch>
                            <ButtonSearch onClick={(SearchNota)}>Cari Data</ButtonSearch>
                    </SearchWrapper>
                    {isCekNota && (
                    <>
                        {cekNotaSearch.map((a) => {

                            return(
                                <Container key={a.NoNota}>
                                    <Box>
                                        <Header>
                                            <div>{a.NoNota}</div>
                                            <div>{a.TglMasuk}</div>
                                        </Header>
                                        <Info>
                                            <LabelCard>Nama:</LabelCard><Value>{a.NamaUser}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>No Hp:</LabelCard><Value>{a.NoHpUser}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>Hp:</LabelCard><Value>{a.MerkHp}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>Kerusakan:</LabelCard><Value>{a.Kerusakan}</Value>
                                        </Info>
                                        <Line />
                                        <Info>
                                            <LabelCard>Teknisi:</LabelCard><Value>{a.Teknisi}</Value>
                                        </Info>
                                        <Info>
                                            <LabelCard>Tgl Keluar:</LabelCard><Value>{(a.TglKeluar)}</Value>
                                        </Info>
                                        <StatusBox>
                                            {a.status.toLocaleUpperCase()}
                                        </StatusBox>
                                    </Box>
                                </Container>
                            )    
                        })}
                    </>
                    )}
                </>}
                </>
                )}
            </WrapperContent>
            
            {/* Modal Section*/}
                {isModalOpen ? 
                <WrapperContent>
                    <Modal isOpen={isModalOpen} onClose={closePopUpModalFilter}>
                    <h1>Filter Data</h1>
                        <div>
                            <LabelModal> Filter Tanggal
                                <SelectModal value={tanggalDipilih} onChange={handlOnChangeTanggalFilter}>
                                    <option value="semua">Semua</option>
                                    <option value="tanggalMasuk">Tanggal Masuk</option>
                                    <option value="tanggalKeluar">Tanggal Keluar</option>
                                </SelectModal>
                            </LabelModal>
                        </div>
                        {isTanggalSelected ? 
                        <>
                         {isTanggalMasuk ? <TanggalMasukComponent /> : <TanggalKeluarComponent />}
                        </> : null}
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
                            <LabelModal>Status:
                                <SelectModal value={statusSelected} onChange={(e) => {setStatusSelected(e.target.value)}}>
                                    <option value="">Semua</option>
                                    <option value="cancel">Cancel</option>
                                    <option value="process">Process</option>
                                    <option value="sudah diambil">Sudah Diambil</option>
                                </SelectModal>
                            </LabelModal>
                        </div>

                        <ButtonGroup>
                            <Button onClick={closePopUpModalFilter}>Tutup</Button>
                            <Button onClick={filteredData}>Filter Data</Button>
                        </ButtonGroup>
                    </Modal>
                </WrapperContent> 
                : 
                <>
                </>}
                
            </>}
        </Wrapper>
    );
}

const Modal = ({isOpen, children}:any) => {
    if(!isOpen) return null;

    return (
        <WrapperModal>
            <WrapperModalContent>
                {children}
            </WrapperModalContent>
        </WrapperModal>
    );
};

const WrapperModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center; 
    align-items: center; 
    z-index: 999;
`;

const WrapperModalContent = styled.div`
    background-color: rgb(var(--cardBackground));
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5); 
`;

const SearchWrapper = styled.div`
display: flex;
padding: 2rem;
align-items: center;
flex-direction: column;
`;


const Wrapper = styled.div`
width: 100%;
height: 100%;
align-item: center;
justify-content: center;
text-align: center;
padding-bottom: 12rem;
` 

const ErrorText = styled.h2`
color: rgb(var(--errorColor));
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

const Buttons = styled(Button)`
padding: 1rem;
font-size: 2rem;
`

const ButtonSearch = styled(Button)`
padding: 1rem;
margin-top: 1rem;
font-size: 1rem;
margin-left: 12px;
`

const LabelSearch = styled.label`
display: flex;
font-size: 1.8rem;
flex-direction: column;
padding: 1rem;
`

const WrapperContent = styled.div`
padding-top: 5rem;
display: absolute;

`

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: rgb(var(--text));
    margin-top: 1rem;
`;

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


const Wrapper2 = styled.div`
    position: relative;
    display: flex;
    width: 100%; 
    height: 100%;
    align-items: center;
    justify-content: center;
`;

const FormCard = styled.div`
    background: rgb(var(--cardBackground));
    padding: 2rem;
    border-radius: 10px;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 100%;
`;


const Form = styled.form`
    display: flex;
    flex-direction: column;
    max-width: 100%;
`;

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

const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
    align-items: center;
`;

const LabelModal = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
    align-items: center;
`;

const Select = styled.select`
width: 15rem;
background: rgb(var(--inputBackground));
color: rgb(var(--text));
text-align: center;
border-radius: 12px;
border: none;
padding-top: 1rem;
`

const SelectModal = styled.select`
width: 15rem;
background: rgb(var(--inputBackground));
color: rgb(var(--text));
text-align: center;
border-radius: 12px;
border: none;
padding-top: 1rem;
`

const FilterWrapper = styled.div`

`

const Search = styled.div`

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
background-color: rgba(255, 255, 255, 0.6);
`

const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 2rem;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const Box = styled.div`
  border: 1px solid #000;
  padding: 16px;
  margin-bottom: 16px;
  width: 350px;
`;

const Header = styled.div`
  display: flex;
  font-size: 1.5rem;
  justify-content: space-between;
  border-bottom: 1px solid #000;
  padding-bottom: 8px;
  margin-bottom: 8px;
`;

const Line = styled.hr`
  border: none;
  border-top: 1px solid #000;
  margin: 8px 0;
`;

const LabelCard = styled.div`
  font-weight: bold;
  display: inline;
`;

const Value = styled.div`
  display: inline;
`;

const Info = styled.div`
  display: grid;
  font-size: 2rem;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
`;

const StatusBox = styled.div`
  font-size: 2rem;
  font-weight: bold;
  border: 1px solid #000;
  padding: 8px;
  margin-top: 8px;
  text-align: center;

`;