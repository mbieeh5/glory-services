/* eslint-disable import/order */
import React, { useEffect } from "react";
import { child, get, getDatabase, ref} from "@firebase/database";
import styled from "styled-components";
import BasicSection3 from "components/BasicSection3";
import { getAuth } from "firebase/auth";
import Table from "../components/TableAdmin";
import { DataSnapshot, onValue } from "firebase/database";
import TableModerator from "components/TableModerator";
import TableCallback from "components/TableCallback";

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
    sudahDikabarin?: boolean;
}


interface State {
    DataResi: DataRes[];
    dataResiBak: DataRes[];
    data7Hari: DataRes[];
    isActivatedBtn: string;
    isBulan: string;
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
    data7Hari: [],
    isBulan: '',
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
    | { type: 'SET_DATA_7HARI'; payload: DataRes[] }
    | { type: 'SET_IS_ACTIVATED_BTN'; payload: string }
    | { type: 'SET_SPAREPART_SELECTED'; payload: string }
    | { type: 'SET_IS_BULAN'; payload: string }
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
      case 'SET_DATA_7HARI':
        return { ...state, data7Hari: action.payload };
      case 'SET_IS_ACTIVATED_BTN':
        return { ...state, isActivatedBtn: action.payload };
      case 'SET_IS_BULAN':
        return { ...state, isBulan: action.payload };
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
    const monthToday = `${year+"-"+month}`

    const sortData = (data: DataRes[]) => {
        return data.sort((a, b) => new Date(a.TglMasuk).getTime() - new Date(b.TglMasuk).getTime());
    };


    useEffect(() => {
        const authG:any = getAuth();
        const DB = ref(getDatabase());
        dispatch({type: "SET_IS_LOADING", payload: true});
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
                    dispatch({ type: "SET_IS_LOADING", payload: false });        
                }else if(userRole === 'mod'){
                    dispatch({type:'SET_IS_ADMIN', payload: false})
                    get(child(DB, "Service/sandboxDS"))
                    .then(async(ss) => {
                        if(ss.exists()){
                            const datas = ss.val() || {};
                            const Array:DataRes[] = Object.values(datas);
                            

                            const recentDataSuccess = Array.filter((item) => {
                                const tglKeluar = item.TglKeluar ? new Date(item.TglKeluar) : null;
                                const noHpValid = item.NoHpUser?.length <= 5 ? null : item.NoHpUser; 
                                const sudahDikabarin = item.sudahDikabarin === true
                                let datenow = new Date(localDate);
                                datenow.setDate(datenow.getDate() - 7);

                                const DateNowComparator = datenow.toLocaleDateString();
                                const tglKeluarComparator = tglKeluar?.toLocaleDateString();
                                return (
                                    (item.status === 'sudah diambil') &&
                                    tglKeluarComparator === DateNowComparator && noHpValid && !sudahDikabarin
                                );
                            })

                            const dateSorter = sortData(recentDataSuccess);
                            const converterStatus = dateSorter.filter(items => items.status === 'sudah diambil' ? items.status = 'belum dikabarin' : items.status);
                            
                            dispatch({type: "SET_DATA_7HARI", payload: converterStatus})

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
    },[localDate, monthToday])

    return(
        <>
        <MainWrapper>
            {state.isAdmin ? 
            <>
              <Table/>
            </> : 
            <>
            {/* BAGIAN MOD & USER */}
            <MainWrapper>
                <BasicSection3 title={`SERVICE ${state.isFinish.toLocaleUpperCase()}`} />
                <div style={{padding: '1rem'}}>
                    <TableModerator data={state.DataResi} isLoading={state.isLoading}/>
                </div>
                <BasicSection3 title={`${("Infokan Kembali User Yang Telah 7Hari Services").toLocaleUpperCase()}`} />
                <div style={{padding: '1rem'}}>
                    <TableCallback data={state.data7Hari} isLoading={state.isLoading}/>
                </div>
              
            </MainWrapper>
            </>}      
            </MainWrapper>
        </>
        )
    }

const MainWrapper = styled.div`
margin-top: 1rem;
`