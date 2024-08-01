/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import Cookies from "js-cookie";
import { getAuth } from "firebase/auth";
import styled, {keyframes} from "styled-components";
import { child, get, getDatabase, ref } from "firebase/database";
import Statistics from "./component/Statistic";
import Laporan from "./component/Laporan";
import Button from "components/Button";
import Head from "next/head";


interface DataStatistic {
    nama: string;
    point: number;
    unit: number;
    oldUnit: number;
}


export default function Statistic() {
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [dataStatic, setDataStatic] = useState<DataStatistic[]>([]);
    const [view, setView] = useState<string>('statistic')
    const [Target, setTarget] = useState<Number>(0);
    const [totalPoints, setTotalPoints] = useState<Number>(0)
    const [totalUnits, setTotalUnits] = useState<Number>(0)
    const route:any = useRouter();
    
    const handleViewChange = (newView:string) => {
        setView(newView)
    }

    const fetchData = useCallback(() => {
        const Auth:any = Cookies.get('_IDs')
        const AuthG:any = getAuth();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(true)
            const isAdmin = AuthG.currentUser.email?.split("@")[0];
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
                });

                get(child(DB, "Data/minimumTarget")).then((ss) => {
                    if(ss.exists()){
                        const tv = ss.val() || {};
                        const trgt = tv.target;
                        setTarget(trgt);
                    }
                }).catch((err) => {
                    console.error(err);
                });
            }
            if(!Auth){
                alert('You Not Supposed to here before login ?')
                route.push('/')
            }
            
        },3500)

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
            <>
                    <ButtonGroup>
                        <Button onClick={() => {handleViewChange('statistic')}} transparent>Statistic</Button>
                        <Button onClick={() => {handleViewChange('laporan')}} transparent>Laporan</Button>
                    </ButtonGroup>
                    <Divider />
                <Wrapper>
                    {view === 'statistic' && <Statistics Data={dataStatic} TotalU={totalUnits} TotalP={totalPoints} Target={Target}/>}
                    {view === 'laporan' && <Laporan />}
                </Wrapper>
            </>
        : 
        <Wrapper>
            <WrapperLoading>
                <Spinner />
            </WrapperLoading>
        </Wrapper>}
        </>
    )

}

const ButtonGroup = styled.div`
display: flex;
align-items: center;
justify-content: center;
gap: 20px;
padding-top: 6.3rem;
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

const Divider = styled.div`
    width: 77%;
    height: 1px;
    background-color: rgb(var(--text));
    margin: 1rem auto 0;
`;
