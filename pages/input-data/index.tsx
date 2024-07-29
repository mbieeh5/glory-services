/* eslint-disable import/order */
import styled from "styled-components";
import BasicSection from "components/BasicSection";
import InputResi from "./component/InputResi";
import { useLogin } from "contexts/LoginContext";
import Head from "next/head";

export default function Undangan() {
    const {isLogin} = useLogin();

    return(
        <Wrapper>
        <Head>
            <title>Input Data || Rraf Project</title>
        </Head>
            <WrapperHeader>
            <WrapperContent>
                <BasicSection title={"Input Data"}>
                    {isLogin && (<InputResi />)}
                </BasicSection>
            </WrapperContent>
            </WrapperHeader>
        </Wrapper>
    )

}

const Wrapper = styled.div`
display: flex;
width: 100%;
height: 100%;
align-item: center;
justify-content: center;
text-align: center;
padding-bottom: 12rem;
`

const WrapperHeader =  styled.div`

`

const WrapperContent = styled.div`
padding-top: 5rem;

`