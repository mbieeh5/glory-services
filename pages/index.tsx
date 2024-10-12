/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref } from "@firebase/database";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import BasicSection3 from "components/BasicSection3";
import { getAuth } from "firebase/auth";
import { Button, Input as Inputs} from "antd";
import { SearchOutlined } from '@ant-design/icons';

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
    sparepart: {
        HargaSparepart: string,
        Sparepart: string,
        TypeOrColor: string,
    }[];
    HargaIbnu: any;
    Teknisi: string;
    Lokasi: string;
    status: string;
}

interface SparepartData {
    Sparepart: string;
    HargaSparepart: any;
    TypeOrColor: string;
}

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);
    const [dataResiBak, setDataResiBak] = useState<DataRes[]>([]);
    const [isActivatedBtn, setIsActivatedBtn] = useState<string>('total');
    const [isKeyword, setIsKeyword] = useState<string>('');
    const [sparepartSelected, setSparepartSelected] = useState<string>('');
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
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
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


    /*const columns: TableProps<DataRes>['columns'] = [
        {
            title: "No Nota",
            dataIndex: "NoNota",
            key: 'NoNota',
            render: (text) => <a>{text}</a>
        },
        {
            title: "Tanggal Masuk",
            dataIndex: "TglMasuk",
            key: "TglMasuk"
        },
        {
            title: "Tanggal Keluar",
            dataIndex: "TglKeluar",
            key: "TglKeluar",
        },
        {
            title: "Merek HP",
            dataIndex: "MerkHp",
            key: "MerkHp"
        },
        {
            title: "Kerusakan",
            dataIndex: "Kerusakan",
            key: "Kerusakan"
        },
        {
            title: "Spareparts",
            dataIndex: "sparepart",
            key: "sparepart",
            render: (_, {sparepart}) => (
                <>
                    {sparepart?.map((a) => {
                        let color = a.Sparepart.length > 1 ? 'geekblue' : 'ggreen';
                        if(a.Sparepart === 'LCD'){
                            color = 'volcano'
                        }
                        return(
                           <Tag key={a.HargaSparepart} color={color}>
                           {a.Sparepart}
                           </Tag> 
                        )
                    })}
                </>
            )
        },
        {
            title: "Harga User",
            dataIndex: "Harga",
            key: "Harga",
        },
        {
            title: 'Imei',
            dataIndex: "Imei",
            key: "Imei",
        },
        {
            title: "Nama User",
            dataIndex: "NamaUser",
            key: "NamaUser"
        },
        {
            title: "No Hp User",
            dataIndex: "NoHpUser",
            key: "NoHpUser",
        },
        {
            title: "Lokasi",
            dataIndex: "Lokasi",
            key: "Lokasi",
        },
        {
            title: "Teknisi",
            dataIndex: "Teknisi",
            key: "Teknisi",
        },
        {
            title: "Penerima",
            dataIndex: "Penerima",
            key: 'Penerima'
        },
        {
            title: "status",
            dataIndex: "status",
            key: 'status1'
        }

    ]*/

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
            const filteredDataResi =  dataResiBak.filter(val => val.status === 'sukses' && val.TglKeluar.length > 5)
            return setDataResi(filteredDataResi);
        }
        if(params === 'pending'){
            const filteredDataResi =  dataResiBak.filter(val => val.status === 'process' && val.TglKeluar === undefined || val.TglKeluar.length < 5)
            return setDataResi(filteredDataResi);
        }
        if(params === 'batal'){
            const filteredDataResi =  dataResiBak.filter(val => val.status === 'cancel' && val.TglKeluar.length > 5)
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
            <Buttons shape="circle" icon={<SearchOutlined />} onClick={() => {filteredData()}} />
            {/*
                <Buttons onClick={() => {filteredData()}}></Buttons>
               */ 
            }
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

                                if(isKeyword === ""){
                                    return  isTeknisiValid && isPenerimaValid && isStatusValid && isTanggalMasukValid
                                }
    
                                const isKerusakanValid = items.Kerusakan?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                                const isMerkHPValid = items.MerkHp?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                                const isNoNotaValid = items.NoNota?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                                const isImeiValid = items.Imei?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                                const isNoHpValid = items.NoHpUser?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                                
                                const isHargaUser = typeof items.Harga === 'number'
                                    ? items.Harga.toString().includes(isKeyword)
                                    : typeof items.Harga === 'string'
                                    ? items.Harga.includes(isKeyword)
                                    : false;
                            
                                const isKeywordValid = isKerusakanValid || isMerkHPValid || isNoNotaValid || isImeiValid || isNoHpValid || isHargaUser;
    
                                return (
                                    isTanggalMasukValid &&
                                    isTeknisiValid &&
                                    isPenerimaValid && 
                                    isStatusValid && 
                                    isKeywordValid
                                );
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
                    }else if(sparepartSelected){
                        const filterData = Array.filter(items => {
                            const sparepartArray: SparepartData[] = Object.values(items.sparepart || {});
                        
                            const isSparepartValid = sparepartArray.some(sparepartItem => {
                                return !sparepartSelected || sparepartItem.Sparepart?.toLowerCase().includes(sparepartSelected.toLowerCase());
                            });
                        
                            const isTeknisiValid = !teknisiSelected || items.Teknisi?.toLowerCase().includes(teknisiSelected.toLowerCase());
                            const isPenerimaValid = !penerimaSelected || items.Penerima?.toLowerCase().includes(penerimaSelected.toLowerCase());
                            const isStatusValid = !statusSelected || items.status?.toLowerCase().includes(statusSelected.toLowerCase());
                            
                            if(isKeyword === ""){
                                return isSparepartValid && isTeknisiValid && isPenerimaValid && isStatusValid
                            }

                            const isKerusakanValid = items.Kerusakan?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isMerkHPValid = items.MerkHp?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isNoNotaValid = items.NoNota?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isImeiValid = items.Imei?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isNoHpValid = items.NoHpUser?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            
                            const isHargaUser = typeof items.Harga === 'number'
                                ? items.Harga.toString().includes(isKeyword)
                                : typeof items.Harga === 'string'
                                ? items.Harga.includes(isKeyword)
                                : false;
                        
                            const isKeywordValid = isKerusakanValid || isMerkHPValid || isNoNotaValid || isImeiValid || isNoHpValid || isHargaUser;

                            return (
                                isSparepartValid && 
                                isTeknisiValid && 
                                isPenerimaValid && 
                                isStatusValid && 
                                isKeywordValid
                            );
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
                    }else if(isKeyword){
                        const filterData = Array.filter(items => {
                            const isKerusakanValid = items.Kerusakan?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isMerkHPValid = items.MerkHp?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isNoNotaValid = items.NoNota?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isHargaUser = typeof items.Harga === 'number'
                                                ? items.Harga.toString().includes(isKeyword)
                                                : typeof items.Harga === 'string'
                                                ? items.Harga.includes(isKeyword)
                                                : false;
                            const isImeiValid = items.Imei?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());
                            const isNoHpValid = items.NoHpUser?.toLocaleLowerCase().includes(isKeyword.toLocaleLowerCase());

                            return isKerusakanValid || isMerkHPValid || isNoNotaValid || isImeiValid || isNoHpValid || isHargaUser;
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
                    }else{
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
                          setDataResiBak(sortedArray);
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
                    color: isActivatedBtn === 'berhasil' ? 'green' : 'rgb(var(--Text))',
                    fontSize: isActivatedBtn === 'berhasil' ? '2.5rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'berhasil' ? 'underline' : 'none',
                  }}>BERHASIL : {sBerhasil} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('pending')}}
                style={{
                    color: isActivatedBtn === 'pending' ? 'yellow' : 'rgb(var(--Text))',
                    fontSize: isActivatedBtn === 'pending' ? '2.5rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'pending' ? 'underline' : 'none',
                  }}>PENDING : {sPending} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('batal')}}
                style={{
                    color: isActivatedBtn === 'batal' ? 'red' : 'rgb(var(--Text))',
                    fontSize: isActivatedBtn === 'batal' ? '2.5rem' : '2rem',
                    textDecorationLine: isActivatedBtn === 'batal' ? 'underline' : 'none',
                  }}>BATAL : {sBatal} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('total')}}
                style={{
                    color: isActivatedBtn === 'total' ? 'rgb(var(--Text))' : 'rgb(var(--Text))',
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
                                        {a.Imei}
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
            <Wrapper2>{/* BAGIAN FILTER ETC */}
                <Search>
                                <Splitter>
                                    <div>
                                    <LabelModal>Sparepart:
                                    <SelectModal placeholder="Sparepart" value={sparepartSelected} onChange={(e) => {setSparepartSelected(e.target.value)}}>
                                        <option value={""}>SEMUA</option>
                                        <option>ANT CABLE</option>
                                        <option>BAZEL HP</option>
                                        <option>BACKDOOR</option>
                                        <option>BATERAI</option>
                                        <option>BUZZER</option>
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
                                        <LabelModal2> Pencarian :
                                            <Input placeholder="Masukan Kata Kunci" onChange={(e) => {setIsKeyword(e.target.value.toLocaleLowerCase())}}/>
                                        </LabelModal2>
                                <TanggalMasukComponent />
                </Search>
            </Wrapper2>

           </> : 
            <>{/* BAGIAN MOD & USER */}
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
margin-top: 1rem;
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

const Buttons = styled(Button)`
  background-color: #007bff;
  color: white;
  margin-top: 27px;
  margin-left: 17px;
  border: none;
  border-radius: 12px;
  max-height: 30px;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

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


const Input = styled(Inputs)`
    background-color: rgb(var(--modalBackground));
    color: rgb(var(--Text));
    border: none; 
    text-align:center;
    padding: 10px;
    border-radius: 8px; 
    font-size: 16px;
    
  &::placeholder {
    color: rgb(var(--Text));
    text-align: center;
    }

    &:hover {
        color: rgb(var(--Background));
    }
    
    &:focus {
        border-color: #ff4d4f;
        color: rgb(var(--Background));
        background-color: rgb(var(--modalBackground));
        box-shadow: 0 0 5px rgba(255, 77, 79, 0.5); 
  }
`;

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
  align-items: center;
  justify-content: center;
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
margin-bottom: 1px;
display: flex;
flex-direction: column;
text-align: center;
color: rgb(var(--Text));
`;

const LabelModal2 = styled(Label)`
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

const Title = styled.button`
  font-size: 2rem;
  padding: 2px;
  font-weight: bold;
  line-height: 1.1;
  margin-bottom: 1rem;
  letter-spacing: -0.00em;
  background: rgb(var(--modalBackground));
  color: rgb(var(--Text));
  border: none;
`;
