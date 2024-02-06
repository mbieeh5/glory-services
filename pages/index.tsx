import React, { useEffect, useState } from "react";
import { getDatabase, ref, child, get } from "@firebase/database";
import styled from "styled-components";
import BasicSection from "components/BasicSection";

export default function Admin() { 

    const [DataResi, setDataResi] = useState([]);

    useEffect(() => {
        const DB = ref(getDatabase());
        get(child(DB, "dataInput/resi")).then(async(datas) => {
            const Data = datas.val() || {};
            const Array = Object.values(Data);
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
                                                       {i}. {data.namaU} | {data.services} | {data.timeMake} | {data.status};
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