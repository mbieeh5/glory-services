/* eslint-disable import/order */
import Button from "components/Button"
import { getDatabase, ref, update } from "firebase/database";
import React, { useState } from "react"
import styled from "styled-components"




export default function InputResi() {

    const resiID = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const lengthText = 3;
        const lengthNum = 7;
        let resi = '';
        for (let i = 0; i < lengthNum; i++) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            resi += numbers[randomIndex];
        }
        for (let i = 0; i < lengthText; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            resi += characters[randomIndex];
        }
        return `${resi}`;
    };
    
        const handleSubmit = (e: any) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const noResi = formData.get('noResi');
            const namaU = formData.get('custName');
            const timeMake = formData.get('inputDate');
            const goodsName = formData.get('goodsName');
            const deliveryFrom = formData.get('deliveryFrom');
            const destination = formData.get('destination');
            const ETD = formData.get('ETD');
            const ETA = formData.get('ETA');
            const ATD = formData.get('ATD');
            const ATA = formData.get('ATA');
                const newData = {
                    [resiId] : {
                        noResi,
                        namaU,
                        timeMake,
                        goodsName,
                        deliveryFrom, 
                        destination,
                        ETD,
                        ETA,
                        ATD,
                        ATA,
                        status: 'onProcess',
                    }
                };
                const resiRef = ref(getDatabase(), `dataInput/resi/${noResi}`);
            update(resiRef, newData)
            .then(() => {
                alert('Resi Berhasil di Input')
                e.target.reset();
                window.location.reload();
            })
            .catch((error) => {
                console.error('Gagal menyimpan data:', error);
            });
        }

    const [resiId] = useState(resiID);

    return(
        <Wrapper>
            <FormCard>
            <Form onSubmit={handleSubmit}>
                <Label>
                    Resi Number:
                    <Input type="text" value={resiId} name="noResi" required/>
                </Label>
                <Splitter>
                <Label>
                    POD Date:
                    <Input type="date" placeholder="01/01/2022" name="inputDate" required/>
                </Label>
                <Label>
                    Customer Name:
                    <Input type="text" placeholder="Customer Name" name="custName" required/>
                </Label>
                <Label>
                    Goods Name:
                    <Input type="text" placeholder="Goods Name" name="goodsName" required/>
                </Label>
                </Splitter>
                <Splitter>
                <Label>
                    Delivery To:
                    <Input type="text" placeholder="Destination" name="destination" required/>
                </Label>
                <Label>
                    Delivery From:
                    <Input type="text" placeholder="Delivery From" name="deliveryFrom" required/>
                </Label>
                </Splitter>
                <Splitter>
                <Label>
                Estimated Time Departure:
                    <Input type="date" placeholder="ETD" name="ETD"/>
                </Label>
                <Label>
                Estimated Time Arrival:
                    <Input type="date" placeholder="ETA" name="ETA"/>
                </Label>
                </Splitter>
                <Splitter>
                <Label>
                Actual Time Departure:
                    <Input type="date" placeholder="ATD" name="ATD"/>
                </Label>
                <Label>
                Actual Time Arrival:
                    <Input type="date" placeholder="ATA" name="ATA"/>
                </Label>
                </Splitter>
                <Buttons type="submit">Submit</Buttons>
            </Form>
            </FormCard>
        </Wrapper>
    )

}

const Wrapper = styled.div`
    position: relative;
    display: flex;
    width: 100%; 
    height: 100%;
    align-items: center;
    justify-content: center;
`;

const FormCard = styled.div`
    background: rgb(var(--cardBackground));
    padding: 2rem;
    border-radius: 10px;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 100%;
`;


const Form = styled.form`
    display: flex;
    flex-direction: column;
    max-width: 100%;
`;

const Splitter = styled.div` 
    display: flex;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
    @media (max-width: 512px) {
        flex-direction: column;
    }
`

const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    padding: 0.5rem;
    border-radius: 5px;
    font-size: 1.5rem;
    text-align: center;
    border: 1px solid #ccc;
    margin-top: 0.5rem;
    height: 4rem;
    background: rgb(var(--inputBackground));
    border: none;
    color: rgb(var(--text));
`;

const Buttons = styled(Button)`

`;