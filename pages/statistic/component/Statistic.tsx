/* eslint-disable import/order */
import React, {useState} from "react";
import styled from "styled-components";
import {  CartesianGrid, Legend, Line, LineChart,  ReferenceLine , ResponsiveContainer, Tooltip, XAxis , YAxis} from 'recharts';
import BasicSection from "components/BasicSection";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import { getDatabase, ref, update } from "firebase/database";



export default function Statistics({Data, TotalU, TotalP, Target}:any) {
    
    
    const [isError, setIsError] = useState<Boolean>(false);
    const [isErrorText, setIsErrorText] = useState<string>('');

    const handleSubmit = (e:any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const target = formData.get('target')?.toString() || '';
        if(target === ''){
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

    return(
        <>
            <BasicSection title="Atur Target" />
                <Wrapper>
                            <Form onSubmit={handleSubmit}>
                                <FormCard>
                                <Wrapper>
                                    {isError && <TextError>{isErrorText}</TextError>}
                                    <Text2>Target Minimum Saat ini <Text1>{25}unit</Text1></Text2>
                                </Wrapper>
                                        <Label> Ubah Target :
                                            <Input placeholder="Masukan Jumlah Target" type="number" name="target" onChange={(e) => {handleOnChange(e.target.value)}} required/>
                                        </Label>
                                        <br />
                                        <ButtonGroupSubmit>
                                            <ButtonSubmit type="submit">Ubah Target</ButtonSubmit>
                                        </ButtonGroupSubmit>
                                </FormCard>
                            </Form>
                </Wrapper>
            <BasicSection title="Statistic Service" />
                <UL>Total Unit Keseluruhan: {TotalU.toLocaleString('id-ID')}</UL>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={Data}
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
                            <ReferenceLine y={Target} label={`Minimal Redeem ${Target} units`} stroke="red" strokeDasharray="6 6" />
                            <ReferenceLine y={15} label="Syarat Redeem 15units" stroke="red" strokeDasharray="6 6" />
                        </LineChart>
                    </ResponsiveContainer>

                    <BasicSection title="Point Terkumpul" />
                            <UL>Total Point Keseluruhan: {TotalP.toLocaleString('id-ID')}</UL>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={Data}
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
                        <ReferenceLine y={(Target*5000)} label={`Min ${(Target*5000).toLocaleString()} points`} stroke="red" strokeDasharray="6 6" />
                        </LineChart>
                    </ResponsiveContainer>
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
