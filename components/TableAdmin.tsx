/* eslint-disable import/order */
import { Table as AntdTable, TableProps, Tag, } from "antd";
import styled from "styled-components";
import React, { ReactNode,} from "react";
import BasicSection2 from "./BasicSection2";
import {Input as Inputs} from "antd";
import {DataSnapshot,endAt,get, getDatabase, onValue,orderByChild,  query,  ref, startAt,   } from "firebase/database";
import { debounce } from "lodash";

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
  Harga: string;
  Imei: string;
  sparepart: SparepartData[];
  HargaIbnu: string;
  Teknisi: string;
  Lokasi: string;
  status: string;
  sudahDikabarin?: boolean;
};

interface SparepartData {
  Sparepart: string;
  HargaSparepart: string;
  TypeOrColor: string;
  Garansi? : string;
};

interface State {
    DataResi: DataRes[],
    DataResiBak1: DataRes[],
    DataResiBak2: DataRes[],
    isActivatedBtn: string;
    isFilteredCheck: boolean;
    isLoading: boolean;
    forSearch: string;
    forSearchData: DataRes[];
    countSuccess: number; 
    countPending: number; 
    countCancel: number; 
    countTotal: number;
    uniqueDateFilter: {text: string, value: string}[];
};

const initialState: State = {
    DataResi: [],
    DataResiBak1: [],
    DataResiBak2: [],
    isActivatedBtn: 'total',
    isFilteredCheck: false,
    isLoading: false,
    forSearch: '',
    forSearchData: [],
    countSuccess: 0,
    countPending: 0,
    countCancel: 0,
    countTotal: 0,
    uniqueDateFilter: [],
};

type Action = 
| { type: 'SET_IS_ACTIVATED_BTN'; payload: string}
| { type: 'SET_DATA_RESI_BAK1'; payload: DataRes[]}
| { type: 'SET_DATA_RESI_BAK2'; payload: DataRes[]}
| { type: 'SET_DATA_FOR_SEARCH'; payload: DataRes[]}
| { type: 'SET_FOR_SEARCH'; payload: string}
| { type: 'SET_DATA_RESI_BAK'; payload: DataRes[]}
| { type: 'SET_IS_LOADING'; payload: boolean}
| { type: 'SET_DATA_RESI'; payload: DataRes[]}
| { type: 'SET_IS_FILTERED_CHECK'; payload: boolean}
| { type: 'SET_COUNT_SUCCESS'; payload: number}
| { type: 'SET_COUNT_PENDING'; payload: number}
| { type: 'SET_COUNT_CANCEL'; payload: number}
| { type: 'SET_COUNT_TOTAL'; payload: number}
| { type: 'SET_UNIQUE_DATE_FILTER'; payload: {text: string, value: string}[]};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_DATA_RESI':
            return {...state, DataResi: action.payload};
        case 'SET_DATA_RESI_BAK1':
            return {...state, DataResiBak1: action.payload};
        case 'SET_DATA_RESI_BAK2':
            return {...state, DataResiBak2: action.payload};
        case 'SET_DATA_FOR_SEARCH':
            return {...state, forSearchData: action.payload};
        case 'SET_FOR_SEARCH':
            return {...state, forSearch: action.payload};
        case 'SET_UNIQUE_DATE_FILTER':
            return {...state, uniqueDateFilter: action.payload};
        case 'SET_IS_ACTIVATED_BTN':
            return {...state, isActivatedBtn: action.payload};
        case 'SET_IS_LOADING':
            return {...state, isLoading: action.payload};
        case 'SET_COUNT_SUCCESS':
            return {...state, countSuccess: action.payload};
        case 'SET_IS_FILTERED_CHECK':
            return {...state, isFilteredCheck: action.payload};
        case 'SET_COUNT_PENDING':
            return {...state, countPending: action.payload};
        case 'SET_COUNT_CANCEL':
            return {...state, countCancel: action.payload};
        case 'SET_COUNT_TOTAL':
            return {...state, countTotal: action.payload};
        default:
            return state;
    }
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

const warrantyChecker = (data: string, TglKeluar: string) => {
    const TglKeluarValid = TglKeluar.length > 5 ? TglKeluar : '0';
    const TanggalFormater = (Dates: string, DatesAfter: number) => {
            const TglKeluarA = new Date(Dates);
            const TglKeluarSG = new Date(TglKeluarA);
            TglKeluarSG.setDate(TglKeluarSG.getDate() + DatesAfter);
            const getDay = TglKeluarSG.getDate() < 10 ? `0${TglKeluarSG.getDate()}` : TglKeluarSG.getDate();
            const getMonth = TglKeluarSG.getMonth();
            const getYear = TglKeluarSG.getFullYear();
            if(new Date() > TglKeluarSG){
                return `${data} (${getDay}/${getMonth + 1}/${getYear}) (SUDAH KADALUARSA)`;
            }
        return `${data.replace('-', ' ')} (${getDay}/${getMonth + 1}/${getYear})`;
    }

    if(TglKeluarValid === '0'){
        return 'Garansi Belum Dimulai';
    }

    if(data === '7-HARI' || data === '7-HARI-1'){

        return TanggalFormater(TglKeluar, 7);
    }
    if(data === '30-HARI' || data === '30-HARI-1'){

        return TanggalFormater(TglKeluar, 30);
    }
    if(data === '90-HARI' || data === '90-HARI-1'){

        return TanggalFormater(TglKeluar, 90);
    }
    if(data === '120-HARI' || data === '120-HARI-1'){

        return TanggalFormater(TglKeluar, 120);
    }
    return 'NON GARANSI'
}

const today = new Date();
//const day = today.getDate().toString().padStart(2, '0');
//const month = (today.getMonth() + 1).toString().padStart(2, '0');
const year = today.getFullYear();
//const localDate = `${year}-${month}-${day}`;
//const dateLocal = new Date(localDate);
const currentMonth = new Date().getMonth() + 1;
const defaultMonthFilter = currentMonth < 10 ? `0${currentMonth}-${year}` : `${currentMonth}-${year}`;



const Table: React.FC = () => {

    const [state, dispatch] = React.useReducer(reducer, initialState);
    
    const handleOnFilterButtonTitle = async (params: string) => {
        dispatch({type: "SET_IS_ACTIVATED_BTN", payload: params});
        if (state.DataResiBak1.length <= state.DataResi.length) {
            dispatch({type: "SET_DATA_RESI_BAK", payload: state.DataResi});
        }
        const sortedArray = (data:DataRes[]) => {
            const sortedData = data.sort((a,b) => {
                const dateA:any = new Date(a.TglMasuk);
                const dateB:any = new Date(b.TglMasuk);
                return dateA - dateB;
            });
            return sortedData;
        }
        
        if(params === 'berhasil'){
            const filteredDataResi =  state.DataResiBak1.filter(val => val.status === 'sukses' && val.TglKeluar.length > 5)
            return dispatch({type: 'SET_DATA_RESI', payload: sortedArray(filteredDataResi)}); 
        }
        if(params === 'pending'){
            const filteredDataResi =  state.DataResiBak1.filter(val => val.status === 'process' && val.TglKeluar === undefined || val.TglKeluar.length < 5)
            return dispatch({type: 'SET_DATA_RESI', payload: sortedArray(filteredDataResi)}); 
        }
        if(params === 'batal'){
            const filteredDataResi =  state.DataResiBak1.filter(val => val.status === 'cancel' && val.TglKeluar.length > 5)
            return dispatch({type: 'SET_DATA_RESI', payload: sortedArray(filteredDataResi)}); 
        }
        if(params === 'total'){
            const filteredDataResi =  state.DataResiBak1;
            return dispatch({type: 'SET_DATA_RESI', payload: sortedArray(filteredDataResi)}); 
        }
        return null;
    }

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        dispatch({type: "SET_IS_LOADING", payload: true});
        if(filters.TglMasuk){
            dispatch({type: "SET_IS_FILTERED_CHECK", payload: true})
            const filterData:DataRes[] = state.DataResiBak1.filter((item) => {
                const month = new Date(item.TglMasuk).getMonth() + 1;
                const  year = new Date(item.TglMasuk).getFullYear();
                const formattedmonth = month < 10 ? `0${month}-${year}` : `${month}-${year}`;
                return filters.TglMasuk.includes(formattedmonth);
            });
            const sortedArray = filterData.sort((a,b) => {
                const dateA:any = new Date(a.TglMasuk);
                const dateB:any = new Date(b.TglMasuk);
                return dateA - dateB;
            })
            const { countSuccess, countPending, countCancel, countTotal } = calculateCounts(filterData)
            dispatch({type: "SET_DATA_RESI", payload: sortedArray});
            dispatch({type: "SET_COUNT_CANCEL", payload: countCancel})
            dispatch({type: "SET_COUNT_PENDING", payload: countPending})
            dispatch({type: "SET_COUNT_SUCCESS", payload: countSuccess})
            dispatch({type: "SET_COUNT_TOTAL", payload: countTotal})
            dispatch({type: "SET_IS_LOADING", payload: false});
        }else{
            dispatch({type: "SET_IS_FILTERED_CHECK", payload: false})
        }
        dispatch({type: "SET_IS_LOADING", payload: false});
    }

    React.useEffect(() => {
        const DB = ref(getDatabase());
        const DB2 = getDatabase();
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        dispatch({type: 'SET_IS_LOADING', payload: true})
        const processRealtimeData = (datas: DataSnapshot) => {
            const dbRef = query(
                ref(DB2, 'Service/sandboxDS'),
                orderByChild('TglMasuk'),
                startAt(`${lastYear}-01-01`),
                endAt(`${currentYear}-12-31`)
            );
            get(dbRef).then(async(datas) => {
                const Data = datas.val() || {};
                const ArrayData: DataRes[] = Object.values(Data).map((item: any) => {
                    if(item.status === 'sudah diambil'){
                            item.status = 'sukses';
                        }
                        return item;
                    });
                const uniqueFilterOptions = ArrayData.reduce((acc, Item) => {
                    const date = new Date(Item.TglMasuk);
                    const month = date.toLocaleString('default', { month: 'long' });
                    const year = date.getFullYear();
                    const monthYear = `${month}(${year})`;
                    const value = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${year}`;
                    if(!acc.find(option => option.value === value)){
                        acc.push({text: monthYear, value});
                    }
                    return acc;

                }, [] as {text: string, value: string}[]).sort((a,b) => {
                    const [monthA, yearA] = a.value.split('-').map((v, i) => (i === 0 ? parseInt(v) : parseInt(v)));
                    const [monthB, yearB] = b.value.split('-').map((v, i) => (i === 0 ? parseInt(v) : parseInt(v)));
                    if(yearA !== yearB) {
                        return yearA - yearB
                    };
                    return monthA - monthB;
                });

                    /*const FilteredData = ArrayData.filter(items => {
                        const dateFilter = new Date(items.TglMasuk);
                        const getMonth = dateFilter.getMonth();
                        const getMonth2 = dateLocal.getMonth();
                        return getMonth === getMonth2;
                    });*/
                const sortedArray = ArrayData.sort((a,b) => {
                    const dateA:any = new Date(a.TglMasuk);
                    const dateB:any = new Date(b.TglMasuk);
                    return dateB - dateA;
                });
                const { countSuccess, countPending, countCancel, countTotal } = calculateCounts(sortedArray)
                dispatch({type: "SET_COUNT_CANCEL", payload: countCancel})
                dispatch({type: "SET_UNIQUE_DATE_FILTER", payload: uniqueFilterOptions})
                dispatch({type: "SET_COUNT_PENDING", payload: countPending})
                dispatch({type: "SET_COUNT_SUCCESS", payload: countSuccess})
                dispatch({type: "SET_COUNT_TOTAL", payload: countTotal})
                dispatch({type: 'SET_DATA_RESI', payload: sortedArray})
                dispatch({type: 'SET_DATA_RESI_BAK1', payload: ArrayData})
                dispatch({type: 'SET_DATA_RESI_BAK2', payload: sortedArray})
                dispatch({type: 'SET_IS_LOADING', payload: false})
            });
        }

        const Unsubs = onValue(DB, processRealtimeData, (error) => {
            console.error("error while fetching data", error);
            dispatch({type: "SET_IS_LOADING", payload: false})
        });
    return () => Unsubs();
    },[])


    const Columns: TableProps<DataRes>["columns"] = [
    {
        title: "LOKASI",
        dataIndex: "Lokasi",
        key: "Lokasi",
        width: 90,
        filters: [
            {text: "Cikaret", value: 'Cikaret'},
            {text: "Sukahati", value: 'Sukahati'},
        ],
        defaultFilteredValue: ['Cikaret', 'Sukahati'],
        onFilter: (value, record) => {
            const valueOfRecord = record.Lokasi ? record.Lokasi : null;
            return value === valueOfRecord
        },
        render: (_, { Lokasi, Keluhan }) => (
            <>
                <Tag style={Keluhan?.length > 91 ? {textAlign: 'left', width: '1385%', padding: '1rem', fontWeight: 'bold'} : {textAlign: 'left', width: '1385%', fontWeight: 'bold'}} color={Lokasi === 'Cikaret' ? 'geekblue' : 'volcano'}>{Lokasi.toLocaleUpperCase()}</Tag>
            </>
        ),
    },
    {
        title: "TANGGAL MASUK",
        dataIndex: "TglMasuk",
        key: "TglMasuk",
        width: 165,
        align: "center",
        filters: state.uniqueDateFilter,
        defaultFilteredValue: [defaultMonthFilter],
        onFilter: (value, record) => { 
            const month = new Date(record.TglMasuk).getMonth() + 1;
            const year = new Date(record.TglMasuk).getFullYear();
            const formattedValue = `${month < 10 ? `0${month}` : `${month}`}-${year}`;
            return value === formattedValue;
        },
        render: (date) => {
            return(
                <div style={{ width: '100%', fontWeight: 'bold'}}>
                {dateFormater(date)}
                </div>
            )
        },
    },
    {
        title: "MEREK HP",
        dataIndex: "MerkHp",
        key: "MerkHp",
        width: 165,  
        align: "center",
        render: (_, {MerkHp}) =>( <div style={{textAlign: 'left', width: '100%', fontWeight: 'bold'}} color={'default'}>{MerkHp.toLocaleUpperCase()}</div>),
    },
    {
        title: "KERUSAKAN",
        dataIndex: "Keluhan",
        key: "Keluhan",
        width: 645,
        align: "start",
        render: (_, {Keluhan}) => (<div style={{textAlign: 'left', width: '100%', fontWeight: 'bold'}} color={'default'}>{Keluhan?.toLocaleUpperCase()}</div>),
    },
    ];

    const handleSearch = debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        dispatch({type: 'SET_FOR_SEARCH', payload: value});
        dispatch({type: 'SET_IS_LOADING', payload: true})
        if(value === ''){
             dispatch({type: 'SET_DATA_RESI', payload: state.DataResiBak1})
        }else{
            const filteredDatas = state.DataResi.filter(entry => {
                return entry.Teknisi?.toLowerCase().includes(value.toLowerCase()) || 
                entry.Kerusakan?.toLowerCase().includes(value.toLowerCase()) ||
                entry.Keluhan?.toLowerCase().includes(value.toLowerCase()) ||
                entry.MerkHp?.toLowerCase().includes(value.toLowerCase()) ||
                entry.Penerima?.toLowerCase().includes(value.toLowerCase()) ||
                entry.sparepart?.some(sp => sp.Sparepart?.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
            });   
            const { countSuccess, countPending, countCancel, countTotal } = calculateCounts(filteredDatas)
            dispatch({type: 'SET_DATA_RESI', payload: filteredDatas})
            dispatch({type: 'SET_IS_LOADING', payload: false})
            dispatch({type: "SET_COUNT_CANCEL", payload: countCancel})
            dispatch({type: "SET_COUNT_PENDING", payload: countPending})
            dispatch({type: "SET_COUNT_SUCCESS", payload: countSuccess})
            dispatch({type: "SET_COUNT_TOTAL", payload: countTotal})
        }
        dispatch({type: 'SET_IS_LOADING', payload: false})
    }, 300)
    
    return (
        <>
        <div>
            <BasicSection2>
            <Title onClick={() => {handleOnFilterButtonTitle('berhasil')}}
                  style={{
                    color: state.isActivatedBtn === 'berhasil' ? 'green' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'berhasil' ? '1.5rem' : '1.5rem',
                    textDecorationLine: state.isActivatedBtn === 'berhasil' ? 'underline' : 'none',
                  }}>BERHASIL : {state.countSuccess} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('pending')}} 
                style={{
                    color: state.isActivatedBtn === 'pending' ? 'yellow' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'pending' ? '1.5rem' : '1.5rem',
                    textDecorationLine: state.isActivatedBtn === 'pending' ? 'underline' : 'none',
                  }}>PENDING : {state.countPending} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('batal')}}
                style={{
                    color: state.isActivatedBtn === 'batal' ? 'red' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'batal' ? '1.5rem' : '1.5rem',
                    textDecorationLine: state.isActivatedBtn === 'batal' ? 'underline' : 'none',
                  }}>BATAL : {state.countCancel} |</Title>
                <Title onClick={() => {handleOnFilterButtonTitle('total')}}
                style={{
                    color: state.isActivatedBtn === 'total' ? 'rgb(var(--Text))' : 'rgb(var(--Text))',
                    fontSize: state.isActivatedBtn === 'total' ? '1.5rem' : '1.5rem',
                    textDecorationLine: state.isActivatedBtn === 'total' ? 'none' : 'none',
                  }}>TOTAL : {state.countTotal} |</Title>
            </BasicSection2>
        </div>
        <WrapperTable>
            <AntdTable<DataRes> 
                columns={Columns} 
                dataSource={state.DataResi} 
                loading={state.isLoading}
                rowKey="NoNota"
                size={"small"}
                onChange={handleTableChange}
                pagination={false}
                scroll={{ x: 0 , y: 130 * 5 }}
                expandable={{
                    expandedRowRender: (record) => {
                        return(
                            <WrapperExpandable status={record?.status || ""} tglKeluar={record?.TglKeluar || null}>
                            <Tag style={{display: 'flex'}} color={'default'}>NO NOTA <div style={{marginLeft: '56px'}}>:</div> <div style={{marginLeft: '1%'}}> {record.NoNota} </div></Tag>
                            <Tag style={{display: 'flex'}} color={'default'}>HARGA USER <div style={{marginLeft: '34px'}}>:</div> <div style={{marginLeft: '1%'}}>Rp {parseInt(record.Harga).toLocaleString('id-ID')}</div></Tag>
                            <Tag style={{display: 'flex'}} color={'default'}>IMEI <div style={{marginLeft: '83px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Imei?.length > 5 ? record.Imei : "IMEI KOSONG"}</div></Tag>
                            <Tag style={{display: 'flex'}} color={'default'}>PERBAIKAN <div style={{marginLeft: '41px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Kerusakan ? record.Kerusakan.toLocaleUpperCase() : "BELUM DI PERBAIKI"}</div></Tag>
                            {record.sparepart &&
                            record.sparepart.map((a,i) => {
                                const colorizeTag = a.Garansi === 'NON-GARANSI' || warrantyChecker(a.Garansi ? a.Garansi : 'null', record.TglKeluar).includes("SUDAH KADALUARSA") ? 'volcano' : 'green';
                                return (
                                    <>
                                        <Tag style={{display: 'flex'}} color={'default'}>SPAREPARTS {i+1} <div style={{marginLeft: '34px'}}>:</div> <div style={{marginLeft: '1%'}}><Tag color={colorizeTag} style={{display: 'flex', flexDirection: "column", margin: '1px'}} key={i}>{a.Sparepart}({a.TypeOrColor}) Rp {parseInt(a.HargaSparepart).toLocaleString('id-ID')} | { a.Garansi === 'NON-GARANSI' ? "NON-GARANSI" : `GARANSI : ${warrantyChecker(a.Garansi ? a.Garansi : 'null', record.TglKeluar)}`}</Tag></div></Tag> 
                                    </>
                                )
                            })
                            }
                            <Tag style={{display: 'flex'}} color={'default'}>NAMA USER <div style={{marginLeft: '39px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.NamaUser?.toLocaleUpperCase()}</div></Tag>
                            <Tag style={{display: 'flex'}} color={'default'}>NO HP USER <div style={{marginLeft: '38px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.NoHpUser}</div></Tag>
                            {record.Teknisi ? <Tag style={{display: 'flex'}} color={'default'}>TEKNISI <div style={{marginLeft: '62px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Teknisi.toLocaleUpperCase()}</div></Tag> : <></> }
                            {record.Teknisi === 'Ibnu' ? <Tag style={{display: 'flex'}} color={'default'}>HARGA IBNU <div style={{marginLeft: '36px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.HargaIbnu ? `Rp ${parseInt(record.HargaIbnu).toLocaleString('id-ID')}` : 0} </div></Tag> : <></>}
                            <Tag style={{display: 'flex'}} color={'default'}>PENERIMA <div style={{marginLeft: '48px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Penerima?.toLocaleUpperCase()}</div></Tag>
                            <Tag style={{display: 'flex'}} color={'default'}>LOKASI <div style={{marginLeft: '66px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Lokasi.toLocaleUpperCase()}</div></Tag>
                            <Tag style={{display: 'flex'}} color={'default'}>TANGGAL KELUAR <div style={{marginLeft: '6px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.TglKeluar ? dateFormater(record.TglKeluar) : "BELUM DI AMBIL"}</div></Tag>
                            <Tag style={{display: 'flex'}} color={record.status === 'sukses' ? 'green-inverse' : record.status === 'process' ? 'gold-inverse' : 'volcano-inverse'}>{record.status.toLocaleUpperCase()}</Tag>
                        </WrapperExpandable>
                        )
                    }
                }}
                components={{
                    body: 
                    {
                        row: (props: { children: ReactNode; "data-row-key" ?: string}) => {
                            const {children, ...rest} = props;
                            const record = rest["data-row-key"] ? state.DataResi.find((d) => d.NoNota === rest["data-row-key"]) : undefined
    
                            return (
                                <StyledRow status={record?.status || ""} tglKeluar={record?.TglKeluar || null} sudahDikabarin={record?.sudahDikabarin || null} {...rest}>
                                    {children}
                                </StyledRow>
                                );
                            },
                    },  
                }}
                />
        </WrapperTable>
        
            <Wrapper2>
                <Search>
                    <LabelModal> 
                        <Input type='text' placeholder="Masukan Kata Kunci" onChange={handleSearch}/>
                    </LabelModal>
                </Search>
            </Wrapper2>
        </>
        )
};
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


const WrapperExpandable = styled.div<{status: string, tglKeluar: string | null}>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: rgb(var(--text));
  font-weight: bold;
  width: 100%;
`;

const WrapperTable = styled.div`
padding-bottom: 2rem;
`

const Title = styled.button`
  font-weight: bold;
  line-height: 1.1;
  letter-spacing: -0.00em;
  background: rgb(var(--modalBackground));
  color: rgb(var(--Text));
  border: none;
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


const StyledRow = styled.tr<{ status: string; tglKeluar: string | null; sudahDikabarin: boolean | null }>`
  background-color: ${({ status, tglKeluar, sudahDikabarin }) => {
    if (status === "sukses" && tglKeluar === "null") return "#B5FB9A";
    if (status === "sukses" && sudahDikabarin === true ) return "#12D200";
    if (status === "process") return "#EDE835";
    if (status === "process" && tglKeluar === 'null') return "#F57E7E";
    if (status === 'cancel' && tglKeluar === 'null') return "#E4B0B0";
    if (status === 'cancel') return "#DB3759";
    if (status === 'claim garansi') return "gray";
    if (status === 'garansi') return "gray";
    return "#D0B4FA";
  }};
  font-size: 12px;
`;

export default Table;
