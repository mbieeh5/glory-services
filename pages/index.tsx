/* eslint-disable import/order */
import React, { useEffect } from "react";
import { child, get, getDatabase, ref } from "@firebase/database";
import styled, {keyframes} from "styled-components";
import BasicSection2 from "components/BasicSection2";
import BasicSection3 from "components/BasicSection3";
import { getAuth } from "firebase/auth";
import { Button, Input as Inputs} from "antd";
import { SearchOutlined } from '@ant-design/icons';
import Table from "../components/TableAdmin";
import { DataSnapshot, onValue } from "firebase/database";
import TableModerator from "components/TableModerator";

interface DataRes {
    NoNota: string;
    NamaUser: string;
    NoHpUser: string;
    TglMasuk: string;
    TglKeluar: string;
    MerkHp: string;
    Kerusakan: string;
    Keluhan: string;
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


interface State {
    DataResi: DataRes[];
    dataResiBak: DataRes[];
    isActivatedBtn: string;
    sparepartSelected: string;
    isAdmin: boolean;
    isLoading: boolean;
    isFinish: string;
    isKeyword: string;
    teknisiSelected: string;
    penerimaSelected: string;
    lokasiSelected: string;
    statusSelected: string;
    tglMskAwal: string;
    tglMskAkhir: string;
    tglKeluar: string;
    sBerhasil: number;
    sPending: number;
    sTotalData: number;
    sBatal: number;
  }
  
  const initialState: State = {
    DataResi: [],
    dataResiBak: [],
    isActivatedBtn: 'total',
    sparepartSelected: '',
    isAdmin: false,
    isLoading: false,
    isFinish: 'null',
    isKeyword: '',
    teknisiSelected: '',
    penerimaSelected: '',
    lokasiSelected: '',
    statusSelected: '',
    tglMskAwal: '',
    tglMskAkhir: '',
    tglKeluar: '',
    sBerhasil: 0,
    sPending: 0,
    sTotalData: 0,
    sBatal: 0,
  };
  
  // Define action types
  type Action =
    | { type: 'SET_DATA_RESI'; payload: DataRes[] }
    | { type: 'SET_DATA_RESI_BAK'; payload: DataRes[] }
    | { type: 'SET_IS_ACTIVATED_BTN'; payload: string }
    | { type: 'SET_SPAREPART_SELECTED'; payload: string }
    | { type: 'SET_IS_ADMIN'; payload: boolean }
    | { type: 'SET_IS_LOADING'; payload: boolean }
    | { type: 'SET_IS_FINISH'; payload: string }
    | { type: 'SET_IS_KEYWORD'; payload: string }
    | { type: 'SET_TEKNISI_SELECTED'; payload: string }
    | { type: 'SET_PENERIMA_SELECTED'; payload: string }
    | { type: 'SET_LOKASI_SELECTED'; payload: string }
    | { type: 'SET_STATUS_SELECTED'; payload: string }
    | { type: 'SET_TGL_MSK_AWAL'; payload: string }
    | { type: 'SET_TGL_MSK_AKHIR'; payload: string }
    | { type: 'SET_TGL_KELUAR'; payload: string }
    | { type: 'SET_S_BERHASIL'; payload: number }
    | { type: 'SET_S_PENDING'; payload: number }
    | { type: 'SET_S_TOTAL_DATA'; payload: number }
    | { type: 'SET_S_BATAL'; payload: number };
  
  // Reducer function
  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case 'SET_DATA_RESI':
        return { ...state, DataResi: action.payload };
      case 'SET_DATA_RESI_BAK':
        return { ...state, dataResiBak: action.payload };
      case 'SET_IS_ACTIVATED_BTN':
        return { ...state, isActivatedBtn: action.payload };
      case 'SET_SPAREPART_SELECTED':
        return { ...state, sparepartSelected: action.payload };
      case 'SET_IS_ADMIN':
        return { ...state, isAdmin: action.payload };
      case 'SET_IS_LOADING':
        return { ...state, isLoading: action.payload };
      case 'SET_IS_FINISH':
        return { ...state, isFinish: action.payload };
      case 'SET_IS_KEYWORD':
        return { ...state, isKeyword: action.payload };
      case 'SET_TEKNISI_SELECTED':
        return { ...state, teknisiSelected: action.payload };
      case 'SET_PENERIMA_SELECTED':
        return { ...state, penerimaSelected: action.payload };
      case 'SET_LOKASI_SELECTED':
        return { ...state, lokasiSelected: action.payload };
      case 'SET_STATUS_SELECTED':
        return { ...state, statusSelected: action.payload };
      case 'SET_TGL_MSK_AWAL':
        return { ...state, tglMskAwal: action.payload };
      case 'SET_TGL_MSK_AKHIR':
        return { ...state, tglMskAkhir: action.payload };
      case 'SET_TGL_KELUAR':
        return { ...state, tglKeluar: action.payload };
      case 'SET_S_BERHASIL':
        return { ...state, sBerhasil: action.payload };
      case 'SET_S_PENDING':
        return { ...state, sPending: action.payload };
      case 'SET_S_TOTAL_DATA':
        return { ...state, sTotalData: action.payload };
      case 'SET_S_BATAL':
        return { ...state, sBatal: action.payload };
      default:
        return state;
    }
  }

export default function Admin() { 

    const [state, dispatch] = React.useReducer(reducer, initialState);

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const localDate = `${year}-${month}-${day}`;

    /*
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
        dispatch({type: "SET_IS_ACTIVATED_BTN", payload: params});
        if (state.dataResiBak.length <= state.DataResi.length) {
            dispatch({type: "SET_DATA_RESI_BAK", payload: state.DataResi});
        }
        
        if(params === 'berhasil'){
            const filteredDataResi =  state.dataResiBak.filter(val => val.status === 'sukses' && val.TglKeluar.length > 5)
            return dispatch({type: 'SET_DATA_RESI', payload: filteredDataResi}); 
        }
        if(params === 'pending'){
            const filteredDataResi =  state.dataResiBak.filter(val => val.status === 'process' && val.TglKeluar === undefined || val.TglKeluar.length < 5)
            return dispatch({type: 'SET_DATA_RESI', payload: filteredDataResi}); 
        }
        if(params === 'batal'){
            const filteredDataResi =  state.dataResiBak.filter(val => val.status === 'cancel' && val.TglKeluar.length > 5)
            return dispatch({type: 'SET_DATA_RESI', payload: filteredDataResi}); 
        }
        if(params === 'total'){
            const filteredDataResi =  state.dataResiBak;
            return dispatch({type: 'SET_DATA_RESI', payload: filteredDataResi}); 
        }
        return null;
    }

    const handleChangeKeyword = (e:  React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLocaleLowerCase();
        dispatch({type: "SET_IS_KEYWORD", payload: value});
    }

    const TanggalMasukComponent = () => {
        return (
        <SplitterInputTanggal>
            <LabelModal>
                Tanggal Keluar
                <Input type="date" value={state.tglKeluar} onChange={(e) => {dispatch({type: "SET_TGL_KELUAR", payload: e.target.value})}}/>
            </LabelModal>
            <LabelModal>
                Tanggal Awal
                <Input type="date" value={state.tglMskAwal} onChange={(e) => {dispatch({type: "SET_TGL_MSK_AWAL", payload: e.target.value})}}/>
            </LabelModal>
            <LabelModal>
                Tanggal Akhir
                <Input type="date" value={state.tglMskAkhir} onChange={(e) => {dispatch({type: "SET_TGL_MSK_AKHIR", payload: e.target.value})}}/>
            </LabelModal> 
            <LabelModal> 
                Pencarian :
                <Input type='text' placeholder="Masukan Kata Kunci" value={state.isKeyword} onChange={handleChangeKeyword} autoFocus />
            </LabelModal>
            <Buttons shape="circle" icon={<SearchOutlined />} onClick={() => {filteredData()}} />
        </SplitterInputTanggal>
        )
    };

    const filterDataResi = (
        array: DataRes[],
        filters: {
            teknisi?: string;
            penerima?: string;
            status?: string;
            keyword?: string;
            sparepart?: string;
            tglMskAwal?: Date;
            tglMskAkhir?: Date;
            tglKeluar?: Date;
            lokasi?: string;
        }
    ) => {
        return array.filter((item) => {
            const { teknisi, penerima, status, keyword, sparepart, tglMskAwal, tglMskAkhir, tglKeluar, lokasi } = filters;

            const dateInRange = (date: string, start?: Date, end?: Date) => {
                const d = new Date(date).setHours(0, 0, 0, 0);
                const s = start ? new Date(start).setHours(0, 0, 0, 0) : d;
                const e = end ? new Date(end).setHours(23, 59, 59, 999) : d;
                return d >= s && d <= e;
            };

            const matches = (field: string | undefined, value: string | undefined) =>
                !value || field?.toLowerCase().includes(value.toLowerCase());

            const hasSparepart = sparepart
                ? Object.values(item.sparepart || {}).some((sp) =>
                    sp.Sparepart?.toLowerCase().includes(sparepart.toLowerCase())
                )
                : true;

                const keywordMatch = keyword ?
                (['Kerusakan', 'Keluhan', 'MerkHp', 'NoNota', 'Imei', 'NoHpUser', 'Harga'] as const).some((key) => {
                    const field = item[key as keyof DataRes];
                    return typeof field === 'string' && field.toLowerCase().includes(keyword.toLowerCase());
                }) 
                : true;

            return (
                dateInRange(item.TglMasuk, tglMskAwal, tglMskAkhir) &&
                dateInRange(item.TglKeluar, tglKeluar, tglKeluar) &&
                matches(item.Teknisi, teknisi) &&
                matches(item.Penerima, penerima) &&
                matches(item.Lokasi, lokasi) &&
                (matches(item.status, status) || (status === 'belum diambil' && item.TglKeluar === 'null')) &&
                hasSparepart && keywordMatch
            );
        });
    };

    const sortData = (data: DataRes[]) => {
        return data.sort((a, b) => new Date(a.TglMasuk).getTime() - new Date(b.TglMasuk).getTime());
    };

    const convertStatus = (data: DataRes[]) => {
        return data.map((item) => ({
            ...item,
            status: item.status === 'sudah diambil' ? 'sukses' : item.status,
        }));
    };

    const calculateCounts = (data: DataRes[]) => {
        const countSuccess = data.filter((item) => item.status === 'sukses' && item.TglKeluar.length > 5).length;
        const countPending = data.filter(
            (item) =>
                (item.TglKeluar === 'null' || item.TglKeluar === undefined) &&
                (item.status === 'sukses' || item.status === 'process')
        ).length;
        const countCancel = data.filter((item) => item.status === 'cancel' && item.TglKeluar.length > 5).length;
        const countTotal = data.filter((item) => item.status !== 'claim garansi').length;

        return { countSuccess, countPending, countCancel, countTotal };
    };

    const filteredData = async () => {        
        try {
            dispatch({type: 'SET_IS_LOADING', payload: true});
            dispatch({type: 'SET_DATA_RESI', payload: []});
            const DB = ref(getDatabase());
            const snapshot = await get(child(DB, `Service/sandboxDS`));
            const dataSS = snapshot.val() || {};
            const array: DataRes[] = Object.values(dataSS);

            const filterOptions = {
                teknisi: state.teknisiSelected,
                penerima: state.penerimaSelected,
                status: state.statusSelected,
                keyword: state.isKeyword,
                sparepart: state.sparepartSelected,
                tglMskAwal: state.tglMskAwal ? new Date(state.tglMskAwal) : undefined,
                tglMskAkhir: state.tglMskAkhir ? new Date(state.tglMskAkhir) : undefined,
                tglKeluar: state.tglKeluar ? new Date(state.tglKeluar) : undefined,
                lokasi: state.lokasiSelected,
            };

            const filtered = filterDataResi(array, filterOptions);
            const sorted = sortData(filtered);
            const converted = convertStatus(sorted);
            const { countSuccess, countPending, countCancel, countTotal } = calculateCounts(converted);

            dispatch({ type: 'SET_DATA_RESI', payload: converted });
            dispatch({ type: 'SET_S_BERHASIL', payload: countSuccess });
            dispatch({ type: 'SET_S_BATAL', payload: countCancel });
            dispatch({ type: 'SET_S_PENDING', payload: countPending });
            dispatch({ type: 'SET_S_TOTAL_DATA', payload: countTotal });
        } catch (error) {
            console.error(error);
        } finally {
            dispatch({ type: 'SET_IS_LOADING', payload: false });
            window.scrollTo(0,0);
        }
    };

    useEffect(() => {
            const authG:any = getAuth();
            const DB = ref(getDatabase());
            dispatch({type: "SET_IS_LOADING", payload: true})
                const userRole = authG.currentUser.email.split('@')[0];
                const userName = authG.currentUser.email.split('@')[1].replace('.com', '');
                const processRealtimeData = (datas: DataSnapshot) => {
                if(userRole === 'user'){
                    dispatch({type:'SET_IS_ADMIN', payload: false})
                    get(child(DB, "Service/sandboxDS")).then(async(datas) => {
                        const Data = datas.val() || {};
                        const Array:DataRes[] = Object.values(Data);
                        const PendingData = Array.filter(item => 
                            item.Penerima.toLocaleLowerCase() === userName.toLocaleLowerCase() && 
                            (item.TglKeluar?.split('T')[0] === localDate || item.TglKeluar === 'null' || item.TglKeluar === undefined)
                        );
                        const converter = PendingData.filter(items => items.status === "sudah diambil" ? items.status = 'sukses' : items.status)
                            if(converter.length > 0){
                                dispatch({type:'SET_IS_FINISH', payload: 'Yang Belum Selesai'});
                                dispatch({type: "SET_IS_LOADING", payload: false})
                                return dispatch({type: "SET_DATA_RESI", payload: converter});
                            }
                            else{
                                dispatch({type: "SET_IS_LOADING", payload: false})
                                return dispatch({type:'SET_IS_FINISH', payload: 'Sudah Selesai'});

                            }
                    }).catch((err) => {
                        console.error(err);
                    })
                }else if(userRole === 'admin'){
                    dispatch({type:'SET_IS_ADMIN', payload: true})
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
                        dispatch({ type: 'SET_S_BERHASIL', payload: countSuccess });
                        dispatch({ type: 'SET_S_BATAL', payload: countCancel });
                        dispatch({ type: 'SET_S_PENDING', payload: countPending });
                        dispatch({ type: 'SET_S_TOTAL_DATA', payload: countTotal });
                        dispatch({ type: "SET_IS_LOADING", payload: false });
                        dispatch({ type: 'SET_DATA_RESI_BAK', payload: sortedArray});
                        return dispatch({ type: 'SET_DATA_RESI', payload: sortedArray });
                    }).catch((err) => {
                        console.error(err);
                    })
                }else if(userRole === 'mod'){
                    dispatch({type:'SET_IS_ADMIN', payload: false})
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
                                dispatch({type:'SET_IS_FINISH', payload: 'Yang Belum Selesai'});
                                dispatch({type: "SET_IS_LOADING", payload: false})
                                return dispatch({ type: 'SET_DATA_RESI', payload: sortedData }); 
                            }
                            else{
                                dispatch({type: "SET_IS_LOADING", payload: false})
                                return dispatch({type:'SET_IS_FINISH', payload: 'Sudah Selesai'});
                            }
    
                        }
                    })
                }
            }
            const Unsubs = onValue(DB, processRealtimeData, (error) => {
                console.error("error while fetching data", error);
                dispatch({type: "SET_IS_LOADING", payload: false})
            });
        return () => Unsubs();
    },[localDate])

    return(
        <>
        <MainWrapper>
            {state.isLoading ? 
            <>
            <Wrapper>
                <WrapperLoading>
                        <Spinner />
                </WrapperLoading>
            </Wrapper>
            </> : <>
            {state.isAdmin ? 
            <>
            <BasicSection2>
                <Title onClick={() => {handleOnFilterButtonTitle('berhasil')}}
                  style={{
                    color: state.isActivatedBtn === 'berhasil' ? 'green' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'berhasil' ? '2.5rem' : '2rem',
                    textDecorationLine: state.isActivatedBtn === 'berhasil' ? 'underline' : 'none',
                  }}>BERHASIL : {state.sBerhasil} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('pending')}}
                style={{
                    color: state.isActivatedBtn === 'pending' ? 'yellow' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'pending' ? '2.5rem' : '2rem',
                    textDecorationLine: state.isActivatedBtn === 'pending' ? 'underline' : 'none',
                  }}>PENDING : {state.sPending} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('batal')}}
                style={{
                    color: state.isActivatedBtn === 'batal' ? 'red' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'batal' ? '2.5rem' : '2rem',
                    textDecorationLine: state.isActivatedBtn === 'batal' ? 'underline' : 'none',
                  }}>BATAL : {state.sBatal} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('total')}}
                style={{
                    color: state.isActivatedBtn === 'total' ? 'rgb(var(--Text))' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'total' ? '2rem' : '2rem',
                    textDecorationLine: state.isActivatedBtn === 'total' ? 'none' : 'none',
                  }}>TOTAL : {state.sTotalData}</Title>
            </BasicSection2>
               <WrapperAntTable>
                    <Table data={state.DataResi} />
                </WrapperAntTable>
            <Wrapper2>{/* BAGIAN FILTER ETC */}
                <Search>
                                <Splitter>
                                    <div>
                                    <LabelModal>Sparepart:
                                    <SelectModal placeholder="Sparepart" value={state.sparepartSelected} onChange={(e) => {dispatch({type: "SET_SPAREPART_SELECTED", payload: e.target.value})}}>
                                        <option value={""}>Semua</option>
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
                                            <SelectModal value={state.teknisiSelected} onChange={(e) => {dispatch({type: "SET_TEKNISI_SELECTED", payload: e.target.value})}}>
                                                <option value="">Semua</option>
                                                <option value="amri">Amri</option>
                                                <option value="ibnu">Ibnu</option>
                                                <option value="rafi">Rafi</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                    <div>
                                        <LabelModal>Penerima:
                                            <SelectModal value={state.penerimaSelected} onChange={(e) => {dispatch({type: "SET_PENERIMA_SELECTED", payload: e.target.value})}}>
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
                                            <SelectModal value={state.lokasiSelected} onChange={(e) => {dispatch({type: "SET_LOKASI_SELECTED", payload: e.target.value})}}>
                                                <option value="">Semua</option>
                                                <option value="Cikaret">Cikaret</option>
                                                <option value="Sukahati">Sukahati</option>
                                            </SelectModal>
                                        </LabelModal>
                                    </div>
                                    <div>
                                        <LabelModal>Status:
                                            <SelectModal value={state.statusSelected} onChange={(e) => {dispatch({type: "SET_STATUS_SELECTED", payload: e.target.value})}}>
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
                                
                </Search>
            </Wrapper2>

           </> : 
            <>{/* BAGIAN MOD & USER */}
            <MainWrapper>
                <BasicSection3 title={`Service ${state.isFinish}`}>
                </BasicSection3>
                <div style={{padding: '1rem'}}>
                    <TableModerator data={state.DataResi}/>
                </div>
              
                    {/*
                        <Wrapper>
                            <Tables>
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
                            {state.DataResi.map((a, i) => {
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
                        </Tables>
                        </Wrapper>
                    */}          
              
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
/*
const Tables = styled.table`
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

const TableHeader = styled.th`
padding: 10px;
text-align: center;
background-color: blue;
white-space: nowrap;
width: 150px;
color: rgb(var(--textSecondary));
`;

const TableData = styled.td`
padding: 10px;
border-bottom: 1px solid #ddd;
width: 150px;
white-space: nowrap;
color: black;
`;

const TableDataA = styled.a`
color: black;
`;

*/
const Buttons = styled(Button)`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  margin-top: 25px; 

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

    const WrapperAntTable = styled.div`
    display: flex;
    padding-bottom: 10px;
    width: 100%;
    max-width: 95%;
    margin: auto;
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
  flex-direction: row;
  width: 100%;
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
  letter-spacing: -0.00em;
  background: rgb(var(--modalBackground));
  color: rgb(var(--Text));
  border: none;
`;
