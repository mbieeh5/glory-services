/* eslint-disable import/order */
import React, { useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import {  CartesianGrid, Legend, Line, LineChart,  ReferenceLine , ResponsiveContainer, Tooltip, XAxis , YAxis} from 'recharts';
import BasicSection from "components/BasicSection";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import { child, get , getDatabase, ref, update } from "firebase/database";


interface DataTarget {
    nama: string;
    point: number;
    unit: number;
}


export default function Statistics({Data, TotalU, TotalP, Target}:any) {
    
    const [isError, setIsError] = useState<Boolean>(false);
    const [isErrorText, setIsErrorText] = useState<string>('');
    const [totalUnitSah, setTotalUnitSah] = useState<number>(0);
    const [bulan, setBulan] = useState<string>('');
    const [totalU, setTotalU] = useState<number>(0);
    const [totalP, setTotalP] = useState<number>(0);
    const [data, setData] = useState<DataTarget[]>([])
    const handleSubmit = (e:any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const target = formData.get('target')?.toString() || '';
        const targetNum:number = parseInt(target) || 0;
        if(target === '' || targetNum <= 0){
            setIsError(true);
            setIsErrorText('Silahkan Masukan Jumlah Target');
            return
        }
        const dataTarget = {
            "target" : parseInt(target),
        }
        const DB = getDatabase();
        const targetRef = ref(DB, `Data/minimumTarget/`);
        update(targetRef, dataTarget)
        .then(async () => {
                 alert(`Target Berhasil di set : ${target}unit`);
                 e.target.reset();
                 window.location.reload();
        }).catch((err) => {
            console.log(err);
        })
    }

    const handleOnChange = (e:any) => {
        if(e.length > 0) {
            setIsError(false)
        }
    }
    const aldi30Persen = totalUnitSah * 0.65;
    const rraf30Persen = totalUnitSah * 0.35;

    const GetDatas = useCallback(async () => {

        const DB = ref(getDatabase());
        
        const dataServicec = await get(child(DB, `Service/sandboxDS`));
        const ssDataService = dataServicec.val() || {};
        
        const ArrayDataServices:any[] = Object.values(ssDataService);
        const FilteredData = ArrayDataServices.filter(items => {
            const status = items.status === "sudah diambil";
            const bulanAja = bulan.slice(5, 7);
        
            if (items.TglKeluar && items.TglKeluar.length > 6) {
                if (!bulanAja) {
                    // Jika bulanAja kosong, tampilkan semua data TglKeluar
                    return status;
                } else {
                    // Jika bulanAja tidak kosong, lakukan filter berdasarkan bulan
                    const bulanKeluar = items.TglKeluar.slice(5, 7); // Mendapatkan bulan dari TglKeluar
                    const tglKeluar = bulanKeluar === bulanAja; // Membandingkan dengan bulan yang diinginkan
        
                    return status && tglKeluar;
                }
            }
        
            return false;
        });
        
        // Menghitung total penerimaan per penerima
        const penerimaanTotal:any[] = FilteredData.reduce((acc, item) => {
            if (acc[item.Penerima]) {
                acc[item.Penerima] += 1; // Menambah 1 jika penerima sudah ada
            } else {
                acc[item.Penerima] = 1; // Inisialisasi dengan 1 jika penerima belum ada
            }
            return acc;
        }, {});
    
        const result = Object.entries(penerimaanTotal).map(([nama, unit]) => ({
            nama,
            unit, 
            point: unit * 5
        }));

        const totalPajak = result.filter(a => {
            if(bulan.slice(5,7) === '07'){
                return a.unit >= 25
            }else {
                return a.unit >= Target;
            }
        }).map(items => {
            const totalPointsah = items.unit * 5 * 0.25;
            return totalPointsah;
        })
        const totalKeseluruhanPajak = totalPajak.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log(totalKeseluruhanPajak)
        setTotalUnitSah(totalKeseluruhanPajak)
        const Totals = result.reduce((acc, item) => {
            acc.totalPoints += item.point
            acc.totalUnits += item.unit
            return acc
        }, {totalPoints: 0, totalUnits: 0})
        
         await setData(result);
         await setTotalU(Totals.totalUnits);
         await setTotalP(Totals.totalPoints);
    }, [bulan, Target])
    
    
        useEffect(() => {
            GetDatas();
        },[GetDatas])

    return(
        <>
            <BasicSection title="Atur Target" />
                <Wrapper>
                            <Form onSubmit={handleSubmit}>
                                <FormCard>
                                <Wrapper>
                                    {isError && <TextError>{isErrorText}</TextError>}
                                    <Text2>Target Minimum Saat ini <Text1>{Target}unit</Text1></Text2>
                                </Wrapper>
                                        <Label> Ubah Target :
                                            <Input placeholder="Masukan Jumlah Target" type="number" name="target" onChange={(e) => {handleOnChange(e.target.value)}} required/>
                                        </Label>
                                        <ButtonGroupSubmit>
                                            <ButtonSubmit type="submit">Ubah Target</ButtonSubmit>
                                        </ButtonGroupSubmit>
                                </FormCard>
                            </Form>
                </Wrapper>
                <br />
                <Wrapper>
                    <Input type="month" onChange={(e) => {setBulan(e.target.value)}}/>
                </Wrapper>
            <BasicSection title="Statistic Service">
                <UL>Total Unit Keseluruhan: {totalU.toLocaleString('id-ID')}</UL>
            </BasicSection>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={data}
                            margin={{
                            top: 20, right: 30, left: 20, bottom: 5,
                        }}
                        >
                            <CartesianGrid strokeDasharray="1 1" />1
                            <XAxis dataKey="nama" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="linear" dataKey="unit" stroke="#8884d8" activeDot={{ r: 5 }}/>
                            <ReferenceLine y={Target} label={`Minimal Redeem ${Target} units`} stroke="red" strokeDasharray="6 6" />
                            <ReferenceLine y={15} label="Syarat Redeem 15units" stroke="red" strokeDasharray="6 6" />
                        </LineChart>
                    </ResponsiveContainer>
                <BasicSection title="Point Terkumpul">
                            <UL>Total Point Keseluruhan: {totalP.toLocaleString('id-ID')}</UL>
                </BasicSection>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={data}
                            margin={{
                                top: 20, right: 30, left: 30, bottom: 10,
                        }}
                        >
                            <CartesianGrid strokeDasharray="1 1" />
                            <XAxis dataKey="nama"  />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey='point' stroke="#8884d8" activeDot={{ r: 5 }} />
                        <ReferenceLine y={(Target*5)} label={`Min ${(Target*5).toLocaleString()} points`} stroke="red" strokeDasharray="6 6" />
                        </LineChart>
                    </ResponsiveContainer>
                <BasicSection title="Ringkasan">
                {data.filter(a => {
                        if(bulan.slice(5,7) === '07'){
                            return a.unit >= 25
                        }else {
                            return a.unit >= Target
                        }
                            })
                            .map((a, i) => {
                                const totalPoint = a.unit * 5;
                                const reducedPoint = totalPoint - (totalPoint * 0.25);
                                
                                return (
                                <ol key={i}>
                                    <li>
                                    {a.nama} || {a.unit} Units || {totalPoint.toLocaleString("ID-id")} Point<br/>
                                    {totalPoint.toLocaleString("ID-id")} Point - 25% = {reducedPoint.toLocaleString("ID-id")} Point
                                    </li>
                                </ol>
                                );
                            })}
                {data.filter(a => {
                    if(bulan.slice(5,7) === '07'){
                        return a.unit <= 25
                    }else{
                        return a.unit < Target
                    }
                })
                .map((a,i ) => {
                    const totalPoint = a.unit * 5;
                    const reducedPoint = totalPoint - (totalPoint * 0.25);
                    return (
                        <ul key={i}>
                            <li>
                                    {a.nama} || {a.unit} Units || {totalPoint.toLocaleString("ID-id")} Point<br/>
                                    {totalPoint.toLocaleString("ID-id")} Point - 25% = {reducedPoint.toLocaleString("ID-id")} Point
                            </li>
                        </ul>    
                    )
                })}
                    <ol>BONUS: {totalUnitSah}
                        <ol>
                            <li>ALDI : {aldi30Persen}</li>
                             <li>RRAF : {rraf30Persen}</li>
                        </ol>
                    </ol>
                </BasicSection>
        </>
    )
}

const UL = styled.ul`
font-size: 2rem;
padding-bottom: 1rem;
`

const Wrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding-top: 1rem;
padding-bottom: 3.3rem;
`
const Text1 = styled.article`
font-weight: bold;
font-size: 1.5rem;
text-align:center;
color: rgb(var(--TextColor));
`

const Text2 = styled.article`
font-size: 1.5rem;
color: rgb(var(--TextColor));
text-align:center;
`

const TextError = styled.article`
font-size: 1.5rem;
color: rgb(var(--errorColor));
text-align:center;
`

const FormCard = styled.div`
display: flex;
flex-direction: column;
width: 31vh;
height: 31vh;
border-radius: 12px;
background: rgb(var(--cardBackground));
box-shadow: 0px 7px 5px rgba(100,100,100, 0.2);
`

const ButtonGroupSubmit = styled(ButtonGroup)`
align-items: center;
justify-content: center;
`

const ButtonSubmit = styled(Button)`
max-width: 50%;
`

const Form = styled.form`
    display: flex;
    flex-direction: column;
    max-width: 100%;
`;


const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
    align-items: center;
`;


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
