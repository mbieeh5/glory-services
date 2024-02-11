/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref,  } from "@firebase/database";
import styled from "styled-components";
import BasicSection2 from "components/BasicSection2";
import Button from "components/Button";
import Cookies from "js-cookie";

interface DataRes {
    ATA: string;
    ATD: string;
    ETA: string;
    ETD: string;
    deliveryFrom: string;
    destination: string;
    goodsName: string;
    namaU: string;
    noResi: string;
    status: string;
    timeMake: string;
}

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    
    const loadNextFiveItems = () => {
        setStartIndex(prevIndex => prevIndex + 5);
    };
    
    const loadPreviousFiveItems = () => {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 5));
    };

    useEffect(() => {
    const Auth:any = Cookies.get('_IDs')

        if(!Auth){
            alert('You Not Supposed to here before login ?')
            window.location.reload();
        }

        const DB = ref(getDatabase());
        get(child(DB, "dataInput/resi")).then(async(datas) => {
            const Data = datas.val() || {};
            const Array:DataRes[] = Object.values(Data);
            setDataResi(Array);
        }).catch((err) => {
            console.error(err);
        })
    },[])

    return(
        <MainWrapper>
            <BasicSection2 title="Recent Resi Data">
                    <Wrapper>
                        <Table>
                            <thead>
                                <TableRow>
                                    <TableHeader>Resi ID</TableHeader>
                                    <TableHeader>Customer Name</TableHeader>
                                    <TableHeader>Goods Name</TableHeader>
                                    <TableHeader>POD Time</TableHeader>
                                    <TableHeader>Delivery From</TableHeader>
                                    <TableHeader>Delivery To</TableHeader>
                                    <TableHeader>ETA</TableHeader>
                                    <TableHeader>ETD</TableHeader>
                                    <TableHeader>ATD</TableHeader>
                                    <TableHeader>ATA</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                </TableRow>
                             </thead>
                        {DataResi.slice(startIndex, startIndex + 5).map((a) => (
                            Object.values(a).map((data, index) => {
                                return(
                                <tbody key={index}>
                                    <TableRow>
                                        <TableData>{data.noResi}</TableData>
                                        <TableData>{data.namaU}</TableData>
                                        <TableData>{data.goodsName}</TableData>
                                        <TableData>{data.timeMake}</TableData>
                                        <TableData>{data.deliveryFrom}</TableData>
                                        <TableData>{data.destination}</TableData>
                                        <TableData>{data.ETA || "N/A"}</TableData>
                                        <TableData>{data.ETD || "N/A"}</TableData>
                                        <TableData>{data.ATD || "N/A"}</TableData>
                                        <TableData>{data.ATA || "N/A"}</TableData>
                                        <TableData>{data.status}</TableData>
                                    </TableRow>
                                </tbody>
                                )
                            })
                        ))}
                    </Table>
            </Wrapper>
                    <Buttons2 onClick={loadPreviousFiveItems}>Previous</Buttons2>
                    <Buttons2 onClick={loadNextFiveItems}>Next</Buttons2>
            </BasicSection2>
        </MainWrapper>
    )
}

const MainWrapper = styled.div`
margin-top: 3rem;
`

const Wrapper = styled.div`
overflow-x: auto;
align-items: center;
max-width: 100%;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  background-color: #4caf50;
  color: rgb(0,0,0);
  `;
  
  const TableData = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
  color: rgb(var(--text));
`;


const Buttons2 = styled(Button)`
padding: 1rem;
margin-top: 2rem;
width: 15rem;
height: 7rem;
margin-left: 2rem;
font-size: 100%;
`