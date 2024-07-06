/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Cookies from "js-cookie";
import { getAuth } from "firebase/auth";
import styled, {keyframes} from "styled-components";
import {  CartesianGrid, Legend, Line, LineChart,  ReferenceLine , ResponsiveContainer, Tooltip, XAxis , YAxis} from 'recharts';
import BasicSection from "components/BasicSection";


const data = [
    { nama: 'Tiara', unit: 1, point: 5000 },
    { nama: 'Yuniska', unit: 3, point: 15000 },
    { nama: 'Sindi', unit: 5, point: 25000 },
    { nama: 'Vina', unit: 15, point: 75000 },
    { nama: 'Reni', unit: 6, point: 30000 },
    { nama: 'Aldi', unit: 10, point: 50000 },
    { nama: 'Amri', unit: 11, point: 55000 },
  ];

export default function Statistic() {
    const [isLoading, setIsLoading] = useState(false);
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();
    const AuthG:any = getAuth();
    const isAdmin = AuthG.currentUser.email.split("@")[0];


    useEffect(() => {
        setIsLoading(false)
        if(isAdmin === 'user'){
            alert('You Not Supposed to here except admin')
            route.push('/')
            return   
        }
    
        setTimeout(() => {
            setIsLoading(true)
            if(!Auth){
                alert('You Not Supposed to here before login ?')
                route.push('/')
            }
        },3000)

    }, [Auth, route, isAdmin])

    return(
        <>
        {isLoading ? 
        <Wrapper>
            <BasicSection title="Statistic Service" />
                <UL>Total Unit Keseluruhan: {(30).toLocaleString('id-ID')}</UL>
            <ResponsiveContainer width="100%" height={500}>
                <LineChart
                    data={data}
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
                    <ReferenceLine y={10} label="Min 10 units" stroke="red" strokeDasharray="6 6" />
                </LineChart>
            </ResponsiveContainer>

            <BasicSection title="Point Terkumpul" />
                    <UL>Total Point Keseluruhan: {(100000).toLocaleString('id-ID')}</UL>
            <ResponsiveContainer width="100%" height={500}>
                <LineChart
                    data={data}
                    margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                }}
                >
                    <CartesianGrid strokeDasharray="6 6" />
                    <XAxis dataKey="nama" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey='point' stroke="#8884d8" activeDot={{ r: 5 }} />
                <ReferenceLine y={10*5000} label="Min 50.000 points" stroke="red" strokeDasharray="6 6" />
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

