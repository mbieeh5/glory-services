/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import { getAuth } from "firebase/auth";
import styled, {keyframes} from "styled-components";
import {  CartesianGrid, Legend, Line, LineChart,  ReferenceLine , ResponsiveContainer, Tooltip, XAxis , YAxis} from 'recharts';
import BasicSection from "components/BasicSection";
import { child, get, getDatabase, ref } from "firebase/database";


interface DataStatistic {
    nama: string;
    point: number;
    unit: number;
}


export default function Statistic() {
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [dataStatic, setDataStatic] = useState<DataStatistic[]>([]);
    const [totalPoints, setTotalPoints] = useState<Number>(0)
    const [totalUnits, setTotalUnits] = useState<Number>(0)
    const route:any = useRouter();
    
    
    useEffect(() => {
        const Auth:any = Cookies.get('_IDs')
        const AuthG:any = getAuth();
        setIsLoading(false);
        setTimeout(() => {
            setIsLoading(true)
            const isAdmin = AuthG.currentUser.email.split("@")[0];
            if(isAdmin === 'user'){
                alert('You Not Supposed to here except admin')
                return route.push('/')
            }else{
                const DB = ref(getDatabase());
                get(child(DB, "Users/dataPenerima")).then((snapshot) => {
                    if(snapshot.exists()){
                        const datas = snapshot.val() || {};
                        const dataArr:DataStatistic[] = Object.values(datas);
                        setDataStatic(dataArr);

                        const totals = dataArr.reduce(
                            (acc, item:any) => {
                                acc.totalPoints += item.point;
                                acc.totalUnits += item.unit;
                                return acc
                            }, 
                            { totalPoints: 0, totalUnits: 0 }
                        );
                        setTotalPoints(totals.totalPoints)
                        setTotalUnits(totals.totalUnits);
                    }
                }).catch((err) => {
                    console.error(err);
                })
            }
            if(!Auth){
                alert('You Not Supposed to here before login ?')
                route.push('/')
            }
            
        },3000)

    }, [route])

    return(
        <>
        {isLoading ? 
        <Wrapper>
            <BasicSection title="Statistic Service" />
                <UL>Total Unit Keseluruhan: {totalUnits.toLocaleString('id-ID')}</UL>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={dataStatic}
                    margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nama" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="linear" dataKey="unit" stroke="#8884d8" activeDot={{ r: 5 }} />
                    <ReferenceLine y={25} label="Minimal Redeem 25 units" stroke="red" strokeDasharray="6 6" />
                    <ReferenceLine y={15} label="Syarat Redeem 15units" stroke="red" strokeDasharray="6 6" />
                </LineChart>
            </ResponsiveContainer>

            <BasicSection title="Point Terkumpul" />
                    <UL>Total Point Keseluruhan: {totalPoints.toLocaleString('id-ID')}</UL>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={dataStatic}
                    margin={{
                    top: 20, right: 30, left: 30, bottom: 10,
                }}
                >
                    <CartesianGrid strokeDasharray="6 6" />
                    <XAxis dataKey="nama" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey='point' stroke="#8884d8" activeDot={{ r: 5 }} />
                <ReferenceLine y={250000} label="Min 250.000 points" stroke="red" strokeDasharray="6 6" />
                </LineChart>
            </ResponsiveContainer>
        </Wrapper> 
        : 
        <Wrapper>
            <WrapperLoading>
                <Spinner />
            </WrapperLoading>
        </Wrapper>}
        </>
    )

}

const UL = styled.ul`
font-size: 2rem;
padding-bottom: 1rem;
`

const Wrapper = styled.div`
overflow-x: auto;
align-items: center;
max-width: 100%;
padding: 2rem;
padding-top: 8rem;
`

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
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 2s linear infinite;
`;

