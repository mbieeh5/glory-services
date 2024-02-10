/* eslint-disable import/order */
import React, { useEffect, useState } from "react";
import { child, get, getDatabase, ref,  } from "@firebase/database";
import styled from "styled-components";
import BasicSection from "components/BasicSection";

interface DataRes {
    namaU: string;
    services: string;
    timeMake: string;
    status: string;
}

export default function Admin() { 

    const [DataResi, setDataResi] = useState<DataRes[]>([]);

    useEffect(() => {
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
            <BasicSection title="Recent Resi Data">
            {DataResi.map((a, index) => {
                const i = index + 1;
                return(
                    <Wrapper key={i}>
                            {Object.values(a).map((data) => {
                                console.log(data)
                                return(
                                <Wrapper key={i}>
                                    <p>
                                        {i}. {data.namaU} | {data.goodsName} | {data.timeMake} | {data.status};
                                    </p>
                                </Wrapper>
                                )
                            })}
                    </Wrapper>
                )
            })}
            </BasicSection>
        </MainWrapper>
    )
}

const MainWrapper = styled.div`
margin-top: 3rem;
`

const Wrapper = styled.div`

`