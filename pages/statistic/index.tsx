/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { getAuth } from "firebase/auth";
import styled, {keyframes} from "styled-components";
import { child, get, getDatabase, ref } from "firebase/database";
import Statistics from "./component/Statistic";
import Head from "next/head";
import Page from "components/Page";


interface DataStatistic {
    nama: string;
    point: number;
    unit: number;
    oldUnit: number;
}


export default function Statistic() {
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [dataStatic, setDataStatic] = useState<DataStatistic[]>([]);
    const [Target, setTarget] = useState<Number>(0);
    const [totalPoints, setTotalPoints] = useState<Number>(0)
    const [totalUnits, setTotalUnits] = useState<Number>(0)
    const route:any = useRouter();


    const fetchData = useCallback(() => {
        const AuthG:any = getAuth();
        const isAdmin = AuthG.currentUser.email?.split("@")[0];
        if(isAdmin === 'user' || isAdmin === 'mod'){
            alert('You Not Supposed to here except admin')
            setIsLoading(false);
            return route.push('/')
        }else{
                const DB = ref(getDatabase());
                get(child(DB, "Users/dataPenerima")).then((snapshot) => {
                    if(snapshot.exists()){
                        const datas = snapshot.val() || {};
                        const dataArr:any = Object.values(datas);
                        setDataStatic(dataArr);
                        const totals = dataArr.reduce(
                            (acc:any, item:any) => {
                                acc.totalPoints += item.point;
                                acc.totalUnits += item.unit;
                                return acc
                            }, 
                            { totalPoints: 0, totalUnits: 0 }
                        );
                        setIsLoading(false);
                        setTotalPoints(totals.totalPoints)
                        setTotalUnits(totals.totalUnits);
                    }
                }).catch((err) => {
                    setIsLoading(false);
                    console.error(err);
                });
                
                get(child(DB, "Data/minimumTarget")).then((ss) => {
                    if(ss.exists()){
                        const tv = ss.val() || {};
                        const trgt = tv.target;
                        setTarget(trgt);
                        setIsLoading(false);
                    }
                }).catch((err) => {
                    console.error(err);
                    setIsLoading(false);
                });
            }
    }, [route])
    
    useEffect(() => {
        setIsLoading(true);
        fetchData();
    }, [fetchData]);

    return(
        <>
        <Head>
            <title>Statistic || Rraf Project</title>
        </Head>
        {isLoading ? 
        <Wrapper>
            <WrapperLoading>
                <Spinner />
            </WrapperLoading>
        </Wrapper>
        : 
                <Page title="Statistic">
                <Wrapper>
                    <Statistics Data={dataStatic} TotalU={totalUnits} TotalP={totalPoints} Target={Target}/>
                </Wrapper>
                </Page>
        }
        </>
    )

}


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