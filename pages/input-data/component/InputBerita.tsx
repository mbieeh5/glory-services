/* eslint-disable import/order */
import Button from "components/Button"
import { getDatabase, push, ref } from "firebase/database";
import React, { useState } from "react"
import styled from "styled-components"




export default function InputBerita() {

    const BeritaID = () => {
        const date = new Date;
        const id = date.getTime();
        return `${id}`;
    };
    
        const handleSubmit = (e: any) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const beritaId = formData.get('beritaId');
            const inputDate = formData.get('inputDate');
            const titleNews = formData.get('titleNews');
            const photos = formData.get('Photo');
                const newData = {
                    [beritaId] : {
                        beritaId,
                        inputDate,
                        photos,
                        titleNews,
                    }
                };
                const resiRef = ref(getDatabase(), `dataInput/berita/${beritaId}`);
            push(resiRef, newData)
            .then(() => {
                alert('Resi Berhasil di Input')
                e.target.reset();
                window.location.reload();
            })
            .catch((error) => {
                console.error('Gagal menyimpan data:', error);
            });
        }

    const [beritaId] = useState(BeritaID);

    return(
        <Wrapper>
            <FormCard>
            <Form onSubmit={handleSubmit}>
                <Label>
                    News Numbers:
                    <Input type="text" value={beritaId} name="beritaId" required/>
                </Label>
                <Splitter>
                <Label>
                    Date:
                    <Input type="datetime-local" placeholder="01/01/2022" name="inputDate" required/>
                </Label>
                <Label>
                    News Title:
                    <Input type="text" placeholder="Judul Berita" name="titleNews" required/>
                </Label>
                <Label>
                    News Photos:
                    <Input type="file" name="Photo" required/>
                </Label>
                </Splitter>
                <Splitter>
                <Label>
                    Desc:
                    <Input type="text" placeholder="Description" name="description" required/>
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
    @media (max-width: 512px){
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