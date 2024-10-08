/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref } from "@firebase/database";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import BasicSection3 from "components/BasicSection3";
import { getAuth } from "firebase/auth";

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
    Imei: string;
    sparepart: any;
    HargaIbnu: any;
    Teknisi: string;
    Lokasi: string;
    status: string;
}

/*interface SparepartData {
    Sparepart: string;
    HargaSparepart: any;
    TypeOrColor: string;
}*/

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);
    const [dataResiBak, setDataResiBak] = useState<DataRes[]>([]);
    const [isActivatedBtn, setIsActivatedBtn] = useState<string>('total');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFinish, setIsFinish] = useState<string>('null');
    const [teknisiSelected, setTeknisiSelected] = useState<string>('');
    const [penerimaSelected, setPenerimaSelected] = useState<string>('');
    const [lokasiSelected, setLokasiSelected] = useState<string>('');
    const [statusSelected, setStatusSelected] = useState<string>('');
    const [tglMskAwal, setTglMskAwal] = useState<string>('');
    const [tglMskAkhir, setTglMskAkhir] = useState<string>('');
    const [tglKeluar, setTglKeluar] = useState<string>('')
    const [sBerhasil, setSBerhasil] = useState<number>(0);
    const [sPending, setSPending] = useState<number>(0);
    const [sTotalData, setSTotalData] = useState<number>(0);
    const [sBatal, setSBatal] = useState<number>(0); 

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Bulan dimulai dari 0
    const year = today.getFullYear();
    const localDate = `${year}-${month}-${day}`;

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

    /**
     * Tambahan untuk status service yang sudah di ambil,
     * memunculkan kembali data servicenya untuk di infokan kembali ke user
     * tambah parameter baru di database untuk per key nya,
     * if(dikabarin === undefined && status === "sukses" && tglKeluar.length > 5)
     * template from <TableDataA 
     *      {   Pelanggan Yth, Terimakasih telah mempercayakan Service Handphone anda kepada GloryCell.
     *           Kami ingin tau perkembangan dari perbaikan yang kami lakukan, Sebagai bentuk Pelayanan dari kami
     *           jika ada keluhan, silahkan hubungi kami kembali. 
     *          Simpan nomor kami untuk bantuan instan dan informasi penting seputar produk dan layanan langsung di chat Anda!
     *       }
     * 
     * Muncul Data Warna Ungu on All Users
     * 
     */

    const handleOnFilterButtonTitle = async (params: string) => {
        setIsActivatedBtn(params);
        if (dataResiBak.length <= DataResi.length) {
            setDataResiBak(DataResi);
        }
        
        if(params === 'berhasil'){
            const filteredDataResi =  dataResiBak.filter(val => val.status === 'sukses')
            return setDataResi(filteredDataResi);
        }
        if(params === 'pending'){
            const filteredDataResi =  dataResiBak.filter(val => val.status === 'process')
            return setDataResi(filteredDataResi);
        }
        if(params === 'batal'){
            const filteredDataResi =  dataResiBak.filter(val => val.status === 'cancel')
            return setDataResi(filteredDataResi);
        }
        if(params === 'total'){
            const filteredDataResi =  dataResiBak;
            return setDataResi(filteredDataResi)
        }
        return null;
    }

    const TanggalMasukComponent = () => {
        return (
        <SplitterInputTanggal>
            <LabelModal>
                Tanggal Keluar
                <Input type="date" value={tglKeluar} onChange={(e) => {setTglKeluar(e.target.value)}}/>
            </LabelModal>
            <LabelModal>
                Tanggal Awal
                <Input type="date" value={tglMskAwal} onChange={(e) => {setTglMskAwal(e.target.value)}}/>
            </LabelModal>
            <LabelModal>
                Tanggal Akhir
                <Input type="date" value={tglMskAkhir} onChange={(e) => {setTglMskAkhir(e.target.value)}}/>
            </LabelModal> 
            <Buttons onClick={() => {filteredData()}}>Filter</Buttons>
        </SplitterInputTanggal>
        )
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
                    let countSuccess = 0;
                    let countPending = 0;
                    let countCancel = 0;
                    let countTotal = 0;
                    if (tglMskAwal && tglMskAkhir) {
                        const filterData = Array.filter(items => {
                            const masukAwal = new Date(tglMskAwal).setHours(0, 0, 0, 0);
                            const masukAkhir = new Date(tglMskAkhir).setHours(23, 59, 59, 999);
                            const tglMasuk = new Date(items.TglMasuk).setHours(0, 0, 0, 0);
                            const isTanggalMasukValid = tglMasuk >= masukAwal && tglMasuk <= masukAkhir;
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = (!statusSelected || 
                                items.status?.toLowerCase().includes(statusSelected.toLowerCase())) ||
                                (statusSelected.toLowerCase() === 'belum diambil' && items.TglKeluar === 'null');    
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
                        countSuccess = converter.filter(item => item.status === 'sukses' && item.TglKeluar.length > 5).length;
                        countPending = converter.filter(item => item.TglKeluar === 'null' || item.TglKeluar === undefined && item.status === 'sukses' || item.status === 'process').length;
                        countCancel = converter.filter(item => item.status === 'cancel' && item.TglKeluar.length > 5).length;
                        countTotal = converter.filter(item => item.status !== 'claim garansi').length;
                        
                        setDataResi(converter);
                    }else if(tglKeluar){
                        const filterData = Array.filter(items => {
                            const tanggalKeluarAwal = new Date(tglKeluar).setHours(0, 0, 0, 0);
                            const tanggalKeluarAkhir = new Date(tglKeluar).setHours(23, 59, 59, 999);
                            const tanggalKeluar = new Date(items.TglKeluar).setHours(0, 0, 0, 0);
                            const isTanggalKeluarValid = tanggalKeluar >= tanggalKeluarAwal && tanggalKeluar <= tanggalKeluarAkhir;
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                            return isTanggalKeluarValid && isTeknisiValid && isPenerimaValid && isStatusValid;
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
                        countSuccess = converter.filter(item => item.status === 'sukses' && item.TglKeluar.length > 5).length;
                        countPending = converter.filter(item => item.TglKeluar === 'null' || item.TglKeluar === undefined && item.status === 'sukses' || item.status === 'process').length;
                        countCancel = converter.filter(item => item.status === 'cancel' && item.TglKeluar.length > 5).length;
                        countTotal = converter.filter(item => item.status !== 'claim garansi').length;
                        setDataResi(converter);
                    }/*else if(sparepartSelected){
                        const filterData = Array.filter(items => {
                            const sparepartArray:SparepartData[] = Object.values(items.sparepart || {});

                            const isSparepartValid = sparepartArray.some(sparepartItem => {
                                return !sparepartSelected || sparepartItem.Sparepart?.toLowerCase().includes(sparepartSelected.toLowerCase());
                            });
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                    
                            return isSparepartValid && isTeknisiValid && isPenerimaValid && isStatusValid;
                        })
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
                        countSuccess = converter.filter(item => item.status === 'sukses' && item.TglKeluar.length > 5).length;
                        countPending = converter.filter(item => item.TglKeluar === 'null' || item.TglKeluar === undefined && item.status === 'sukses' || item.status === 'process').length;
                        countCancel = converter.filter(item => item.status === 'cancel' && item.TglKeluar.length > 5).length;
                        countTotal = converter.filter(item => item.status !== 'claim garansi').length;

                        setDataResi(converter);
                    }*/else{
                        const filterData = Array.filter(items => {
                            const tglMasuk = new Date(items.TglMasuk).setHours(0, 0, 0, 0);
                            const isTanggalMasukValid = (!tglMskAwal || tglMasuk >= new Date(tglMskAwal).setHours(0, 0, 0, 0)) && (!tglMskAkhir || tglMasuk <= new Date(tglMskAkhir).setHours(23, 59, 59, 999));
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = (!statusSelected || 
                                items.status?.toLowerCase().includes(statusSelected.toLowerCase())) ||
                                (statusSelected.toLowerCase() === 'belum diambil' && items.TglKeluar === 'null');                              
                            const isLokasiValid = !lokasiSelected || items.Lokasi?.toLowerCase().includes(lokasiSelected.toLowerCase());
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
                        countSuccess = converter.filter(item => item.status === 'sukses' && item.TglKeluar.length > 5).length;
                        countPending = converter.filter(item => item.TglKeluar === 'null' || item.TglKeluar === undefined && item.status === 'sukses' || item.status === 'process').length;
                        countCancel = converter.filter(item => item.status === 'cancel' && item.TglKeluar.length > 5).length;
                        countTotal = converter.filter(item => item.status !== 'claim garansi').length;
                        setDataResi(converter);
                    }              
                    setSBerhasil(countSuccess);
                    setSBatal(countCancel);
                    setSPending(countPending);      
                    setSTotalData(countTotal);      
                setIsLoading(false);
                }).catch((error) => {
                    console.error(error)
                    setIsLoading(false);
                })
        })
    };
    
    useEffect(() => {
        const fetchData = () => {
            const authG:any = getAuth();
            const DB = ref(getDatabase());
            setIsLoading(true);
                const userRole = authG.currentUser.email.split('@')[0];
                const userName = authG.currentUser.email.split('@')[1].replace('.com', '');
                if(userRole === 'user'){
                    setIsAdmin(false);
                    get(child(DB, "Service/sandboxDS")).then(async(datas) => {
                        const Data = datas.val() || {};
                        const Array:DataRes[] = Object.values(Data);
                        const PendingData = Array.filter(item => 
                            item.Penerima.toLocaleLowerCase() === userName.toLocaleLowerCase() && 
                            (item.TglKeluar?.split('T')[0] === localDate || item.TglKeluar === 'null' || item.TglKeluar === undefined)
                        );
                        const converter = PendingData.filter(items => items.status === "sudah diambil" ? items.status = 'sukses' : items.status)
                            if(converter.length > 0){
                                setIsFinish('Yang Belum Selesai')
                                setIsLoading(false);
                                return setDataResi(converter); 
                            }
                            else{
                                setIsLoading(false);
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
                        const FilteredArray = Array.filter(items => {
                            const dateFilter = new Date(items.TglMasuk);
                            const getMonth = dateFilter.getMonth();
                            const dateLocal = new Date(localDate);
                            const getMonth2 = dateLocal.getMonth();
                            return getMonth === getMonth2
                        })
                        const sortedArray = FilteredArray.sort((a, b) => {
                            const dateA:any = new Date(a.TglMasuk);
                            const dateB:any = new Date(b.TglMasuk);
                            return dateB - dateA;
                        })
                        const countSuccess = sortedArray.filter(item => item.status === 'sukses' && item.TglKeluar.length > 5).length;
                        const countPending = sortedArray.filter(item => item.TglKeluar === 'null' || item.TglKeluar === undefined && item.status === 'sukses' || item.status === 'process').length;
                        const countCancel = sortedArray.filter(item => item.status === 'cancel' && item.TglKeluar.length > 5).length;
                        const countTotal = sortedArray.filter(item => 
                            item.status !== 'claim garansi'
                          ).length;
                        setSBerhasil(countSuccess);
                        setSBatal(countCancel);
                        setSPending(countPending);
                        setSTotalData(countTotal)
                        setIsLoading(false);

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
                                (items.TglKeluar === undefined || items.TglKeluar === 'null' || items.TglKeluar?.split('T')[0] === localDate)
                            );
                            const converter = PendingData.filter(items => items.status === "sudah diambil" ? items.status = 'sukses' : items.status)
                            if(PendingData.length > 0){
                                const sortedData = converter.sort((a, b) => {
                                    const dateA:any = new Date(a.TglMasuk);
                                    const dateB:any = new Date(b.TglMasuk);
                                    return dateB - dateA ;
                                });
                                setIsFinish('Yang Belum Selesai')
                                setIsLoading(false);
                                return setDataResi(sortedData); 
                            }
                            else{
                                setIsLoading(false);
                                return setIsFinish('Mu Sudah Selesai')
                            }
    
                        }
                    })
                }
    
        };
        fetchData();
    },[localDate])

    return(
        <>
        <MainWrapper>
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
            <BasicSection2>
                <Title onClick={() => {handleOnFilterButtonTitle('berhasil')}}
                  style={{
                    color: isActivatedBtn === 'berhasil' ? 'green' : 'white',
                    fontSize: isActivatedBtn === 'berhasil' ? '2.5rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'berhasil' ? 'underline' : 'none',
                  }}>BERHASIL : {sBerhasil} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('pending')}}
                style={{
                    color: isActivatedBtn === 'pending' ? 'yellow' : 'white',
                    fontSize: isActivatedBtn === 'pending' ? '2.5rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'pending' ? 'underline' : 'none',
                  }}>PENDING : {sPending} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('batal')}}
                style={{
                    color: isActivatedBtn === 'batal' ? 'red' : 'white',
                    fontSize: isActivatedBtn === 'batal' ? '2.5rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'batal' ? 'underline' : 'none',
                  }}>BATAL : {sBatal} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('total')}}
                style={{
                    color: isActivatedBtn === 'total' ? 'white' : 'white',
                    fontSize: isActivatedBtn === 'total' ? '2rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'total' ? 'none' : 'none',
                  }}>TOTAL : {sTotalData}</Title>
                    <TableContainer>
                        <Table>
                            <THead>
                                <tr>
                                    <TableHeader>No Nota</TableHeader>
                                    <TableHeader>Tanggal Masuk</TableHeader>
                                    <TableHeader>Tanggal Keluar</TableHeader>
                                    <TableHeader>Merk HP</TableHeader>
                                    <TableHeader>Kerusakan</TableHeader>
                                    <TableHeader>Spareparts</TableHeader>
                                    <TableHeader>Harga Sparepart</TableHeader>
                                    <TableHeader>Harga User</TableHeader>
                                    <TableHeader>Imei</TableHeader>
                                    <TableHeader>Nama user</TableHeader>
                                    <TableHeader>Nomor HP User</TableHeader>
                                    <TableHeader>Lokasi</TableHeader>
                                    <TableHeader>Teknisi</TableHeader>
                                    <TableHeader>Penerima</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </tr>
                             </THead>
                        {DataResi.map((a, i) => {
                            const ConvertNumber = (noHP:string) => {
                                if(noHP.startsWith('0')){
                                    return '62' + noHP.slice(1);
                                }
                                return noHP
                            }
                            const noHpConverter = ConvertNumber(a.NoHpUser);
                            const spareparts:any = a.sparepart || {};
                            let sparepartList = [];
                            let totalSparepartPrice = 0;

                            for(let key in spareparts){
                                if(spareparts.hasOwnProperty(key)){
                                    const part = spareparts[key];
                                    sparepartList.push(`${part.Sparepart}(${part.TypeOrColor})`);
                                    totalSparepartPrice += parseInt(part.HargaSparepart || "0")
                                }
                            }

                            return(
                                <tbody key={i}>
                                    <TableRow status={a.status} tglKeluar={a.TglKeluar}>
                                    <TableData>
                                    <TableDataA
                                            href={`https://wa.me/${noHpConverter}?text=Nota Services ${a.NoNota}, dibuat oleh ${
                                            a.Lokasi === 'Cikaret' 
                                                ? `CKRT-${a.Penerima}` 
                                                : a.Lokasi === 'Sukahati' 
                                                ? `SKHT-${a.Penerima}` 
                                                : 'null'
                                            }.%0A%0A Haii Ka ${a.NamaUser}, ini dari Glory Cell, mau infokan untuk handphone ${
                                            a.MerkHp
                                            } dengan kerusakan ${
                                            a.Kerusakan
                                            } sudah selesai dan bisa diambil sekarang ya. Untuk Pengambilan Handphonenya dimohon bawa kembali nota servicenya ya kak, dan ini untuk invoicenya. Terimakasih%0A%0Ahttps://struk.rraf-project.site/struk?noNota=${a.NoNota}
                                            %0A%0A *Glory Cell* %0A *Jl. Raya Cikaret No 002B-C* %0A *Hubungi kami lebih mudah, simpan nomor ini!* 08999081100 %0A *Follow IG Kami :* @glorycell.official 
                                            `}
                                            target="_blank"
                                        >
                                            {a.NoNota}
                                        </TableDataA>
                                        </TableData>
                                        <TableData>{dateFormater(a.TglMasuk)}</TableData>
                                        <TableData>{dateFormater(a.TglKeluar)}</TableData>
                                        <TableData>{a.MerkHp}</TableData>
                                        <TableData>{a.Kerusakan}</TableData>
                                        <TableData>{sparepartList.join(', ')}</TableData>
                                        <TableData>{a.HargaIbnu && parseInt(a.HargaIbnu) !== 0 
                                            ? parseInt(a.HargaIbnu).toLocaleString() 
                                            : (totalSparepartPrice !== 0 
                                                ? totalSparepartPrice.toLocaleString() 
                                                : 0)
                                            }</TableData>
                                        <TableData>{parseInt(a.Harga).toLocaleString()}</TableData>
                                        <TableData>
                                        {a.Imei ? a.Imei.slice(0, -4).replace(/\d/g, '*') + a.Imei.slice(-4) : "0"}
                                        </TableData>
                                        <TableData>{a.NamaUser}</TableData>
                                        <TableData><TableDataA href={`https://wa.me/${noHpConverter}`} target="_blank">{a.NoHpUser}</TableDataA></TableData>
                                        <TableData>{a.Lokasi}</TableData>
                                        <TableData>{a.Teknisi || a.status}</TableData>
                                        <TableData>{a.Penerima}</TableData>
                                        <TableData>{a.status}</TableData>
                                    </TableRow>
                                </tbody>
                                )
                            })}
                    </Table>
            </TableContainer>
            </BasicSection2>  
            
            <Wrapper2>
                <Search>
                                <Splitter>
                                    <div>
                                    <LabelModal>Sparepart:
                                    <Input placeholder="Masukan Kata Kunci" onChange={(e) => {}}/>

                                    {/*<SelectModal placeholder="Sparepart" value={sparepartSelected} onChange={(e) => {setSparepartSelected(e.target.value)}}>
                                        <option value={""}>SEMUA</option>
                                        <option>ANT CABLE</option>
                                        <option>BAZEL HP</option>
                                        <option>BACKDOOR</option>
                                        <option>BATERAI</option>
                                        <option>CON T/C</option>
                                        <option>FLEXI BOARD</option>
                                        <option>FLEXI CON SIM</option>
                                        <option>FLEXI FINGERPRINT</option>
                                        <option>FLEXI O/F</option>
                                        <option>FLEXI O/F + VOL</option>
                                        <option>FLEXI VOL</option>
                                        <option>LCD</option>
                                        <option>MIC</option>
                                        <option>SIMLOCK</option>
                                        <option>SPEAKER</option>
                                        <option>TOMBOL LUAR</option>
                                    </SelectModal>*/}
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
                                                <option value="belum diambil">Belum Diambil</option>
                                                <option value="cancel">Cancel</option>
                                                <option value="claim garansi">Claim Garansi</option>
                                                <option value="process">Process</option>
                                                <option value="sudah diambil">Sukses</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                </Splitter>
                                    <TanggalMasukComponent />
                                <Splitter2>
                                </Splitter2>
                </Search>
            </Wrapper2>

           </> : 
            <>
            <MainWrapper>
                <BasicSection3 title={`Service ${isFinish}`}>
                        <Wrapper>
                            <Table>
                                <thead>
                                    <tr>
                                    <TableHeader>No Nota</TableHeader>
                                    <TableHeader>Tanggal Masuk</TableHeader>
                                    <TableHeader>Tanggal Keluar</TableHeader>
                                    <TableHeader>Merk HP</TableHeader>
                                    <TableHeader>Kerusakan</TableHeader>
                                    <TableHeader>Spareparts</TableHeader>
                                    <TableHeader>Harga User</TableHeader>
                                    <TableHeader>Lokasi</TableHeader>
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

                                const spareparts:any = a.sparepart || {};
                                let sparepartList = [];
    
                                for(let key in spareparts){
                                    if(spareparts.hasOwnProperty(key)){
                                        const part = spareparts[key];
                                        sparepartList.push(`${part.Sparepart}(${part.TypeOrColor})`);
                                    }
                                }
                                    return (
                                    <tbody key={i}>
                                        <TableRow status={a.status} tglKeluar={a.TglKeluar}>
                                        <TableData>
                                        <TableDataA
                                            href={`https://wa.me/${noHpConverter}?text=Nota Services ${a.NoNota}, dibuat oleh ${
                                            a.Lokasi === 'Cikaret' 
                                                ? `CKRT-${a.Penerima}` 
                                                : a.Lokasi === 'Sukahati' 
                                                ? `SKHT-${a.Penerima}` 
                                                : 'null'
                                            }.%0A%0A Haii Ka ${a.NamaUser}, ini dari Glory Cell, mau infokan untuk handphone ${
                                            a.MerkHp
                                            } dengan kerusakan ${
                                            a.Kerusakan
                                            } sudah selesai dan bisa diambil sekarang ya. Untuk Pengambilan Handphonenya dimohon bawa kembali nota servicenya ya kak, dan ini untuk invoicenya. Terimakasih%0A%0Ahttps://struk.rraf-project.site/struk?noNota=${a.NoNota}
                                            %0A%0A *Glory Cell* %0A *Jl. Raya Cikaret No 002B-C* %0A *Hubungi kami lebih mudah, simpan nomor ini!* 08999081100 %0A *Follow IG Kami :* @glorycell.official 
                                            `}
                                            target="_blank"
                                        >
                                            {a.NoNota}
                                        </TableDataA>
                                        </TableData>
                                        <TableData>{dateFormater(a.TglMasuk)}</TableData>
                                        <TableData>{dateFormater(a.TglKeluar)}</TableData>
                                        <TableData>{a.MerkHp}</TableData>
                                        <TableData>{a.Kerusakan}</TableData>
                                        <TableData>{sparepartList.join(', ')}</TableData>
                                        <TableData>{parseInt(a.Harga).toLocaleString()}</TableData>
                                        <TableData>{a.Lokasi}</TableData>
                                        <TableData>{a.status}</TableData>                                      
                                        </TableRow>
                                    </tbody>
                                    )
                                })}
                        </Table>
                </Wrapper>
                </BasicSection3>
            </MainWrapper>
            </>}
            </>}        
            </MainWrapper>
        </>
        )
    }

const MainWrapper = styled.div`
margin-top: 3rem;
`
const TableContainer = styled.div`
  max-height: 608px;  /* Membatasi tinggi maksimal 500px */
  overflow-y: auto;   /* Menambahkan scroll vertikal */
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const THead = styled.thead`
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 10;   
    width: 100%;
`

const Table = styled.table`
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const TableRow = styled.tr<{status : string, tglKeluar: string}>`
    background-color: ${props => {
        if (props.status === 'sukses' && (props.tglKeluar === 'null' || props.tglKeluar === '')) {
            return 'cyan';
          }
        if (props.status === 'cancel' && (props.tglKeluar === 'null' || props.tglKeluar === '')) {
            return '#FE9900';
        }
        if (props.status === 'claim garansi' && (props.tglKeluar === 'null' || props.tglKeluar === '')){
            return 'gray'
        }
          switch (props.status) {
            case 'sukses':
              return 'green'; 
            case 'claim garansi':
                return 'white';
            case 'cancel':
              return 'red';
            default:
              return 'yellow';
          }
        }};
`;

const Buttons = styled.button`
  background-color: #007bff;
  color: white;
  margin-top: 23px;
  border: none;
  border-radius: 12px;
  max-height: 30px;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

/*const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;*/

const TableHeader = styled.th`
  padding: 10px;
  text-align: center;
  background-color: blue;
  white-space: nowrap;
  width: 150px; /* Sesuaikan lebar kolom */
  color: rgb(var(--textSecondary));
  `;
  
  const TableData = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  width: 150px; /* Sesuaikan lebar kolom */
  white-space: nowrap;
  color: black;
`;
  
  const TableDataA = styled.a`
  color: black;
  `;

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


const Input = styled.input`
    background-color: rgb(var(--modalBackground));
    border: rgb(var(--modalBackground));
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
`


const Wrapper = styled.div`
overflow-x: auto;
align-items: center;
max-width: 100%;
`

const Wrapper2 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: rgb(var(--cardBackground));
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 91%;
  margin: auto;
`;

const Search = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Splitter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const SplitterInputTanggal = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 14px;
  color: rgb(var(-Text));
  margin-bottom: 8px;
  display: block;
`;

const LabelModal = styled(Label)`
display: flex;
flex-direction: column;
text-align: center;
color: rgb(var(--Text));
`;

const SelectModal = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 12px;
  color: rgb(var(--Text));
  background-color: rgb(var(--modalBackground));
  border: rgb(var(--modalBackground));
  width: 100%;
  max-width: 100px;
  box-shadow: inset 0px 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Splitter2 = styled.div`
  height: 1px;
  background-color: #e0e0e0;
`;

const Title = styled.button`
  font-size: 2rem;
  padding: 2px;
  font-weight: bold;
  line-height: 1.1;
  margin-bottom: 4rem;
  letter-spacing: -0.00em;
  background: rgb(var(--modalBackground));
  color: rgb(var(--Text));
  border: none;
`;
