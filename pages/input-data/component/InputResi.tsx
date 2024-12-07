/* eslint-disable import/order */
import Button from "components/Button"
import ButtonGroup from "components/ButtonGroup";
import { getDatabase, ref, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import React, { useState } from "react"
import Swal from "sweetalert2";
import styled from "styled-components"
import {Col, Flex, Input as Inputs, Row } from "antd"
import { useRouter } from "next/router";
const {TextArea} = Inputs




export default function InputResi() {

        const UserName = getAuth().currentUser?.email?.toLocaleLowerCase().split('@')[1].replace('.com', '');
        const router = useRouter();
    
    const NoNota = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const lengthText = 3;
        const lengthNum = 3;
        let notaID = '';
        for (let i = 0; i < lengthNum; i++) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            notaID += numbers[randomIndex];
        }
        for (let i = 0; i < lengthText; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            notaID += characters[randomIndex];
        }
        return `GL${notaID}`;
    };
    
    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const Harga = hargaBaru;
        const Keluhan = formData.get('keluhan');
        const MerkHp = formData.get('merkHp');
        const NamaUser = formData.get('namaUser');
        const NoHpUser = formData.get('noHpUser');
        const NoNota = formData.get('noNota');
        const Imei = formData.get('imei');
        const Lokasi = formData.get('lokasi');
        const Penerima = formData.get('penerima');
        const TglMasuk = formData.get('tglMasuk');
        
        const newData = {
            [notaId]: {
                Harga,
                Keluhan,
                MerkHp,
                NamaUser,
                NoHpUser,
                NoNota,
                Imei,
                Penerima,
                Lokasi,
                TglMasuk,
                status: 'process',
            },
        };
    
        if (notaId === '') {
            setIsError(true);
            setError('No Nota Harap di isi');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        } else if (Harga < 10000) {
            setIsError(true);
            setError('Harap Masukan Nominal Lengkap');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            Swal.fire({
                title: 'Apakah Anda yakin?',
                text: "Anda tidak akan bisa mengembalikan perubahan ini!",
                icon: 'warning',
                background: "rgb(var(--cardBackground))",
                color: "rgb(var(--text))",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: 'rgb(var(--errorColor))',
                confirmButtonText: 'Ya, simpan!',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsError(false);
                    const resiRef = ref(getDatabase(), `Service/sandboxDS`);
                    update(resiRef, newData)
                        .then(() => {
                            Swal.fire(
                                'Berhasil!',
                                'Service telah berhasil di input.',
                                'success'
                            );
                            e.target.reset();
                            router.push('/');
                        })
                        .catch((error) => {
                            console.error('Gagal menyimpan data:', error);
                            Swal.fire(
                                'Gagal!',
                                'Terjadi kesalahan saat menyimpan data.',
                                'error'
                            );
                        });
                }
            });
        }
    };
    

    const [hargaBaru, setHargaBaru] = useState<number>(0);
    const [notaId, setNotaId] = useState("");
    const [error, setError] = useState('null')
    const [isError, setIsError] = useState(false);

    return(
        <>
            <FormCard>
                <ErrEvent>{isError ? error : ''}</ErrEvent>
                    <Form onSubmit={handleSubmit}>
                        <Flex gap={'middle'} vertical>
                            <Row>
                                <Col span={12}>
                                    <Label>
                                        NO NOTA:
                                        <Input type="text" onClick={() => setNotaId(NoNota)} placeholder="Klik Buat No Nota" value={notaId.toUpperCase()} onChange={(e) => setNotaId(e.target.value)} name="noNota" required readOnly/>
                                    </Label>
                                </Col>
                                <Col span={12}>
                                    <Label>
                                        TANGGAL MASUK:
                                        <Input type="datetime-local" placeholder="Tanggal Masuk" name="tglMasuk" required/>
                                    </Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Label>
                                        NAMA PELANGGAN:
                                        <Input type="text" placeholder="Masukan Nama User" name="namaUser" required/>
                                    </Label>
                                </Col>
                                <Col span={12}>
                                <Label>
                                    NOMOR PELANGGAN:
                                    <Input type="number" placeholder="08xxxxxx" name="noHpUser" required/>
                                </Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Label>
                                        MEREK HP:
                                        <Input type="text" placeholder="Masukan Tipe HP LENGKAP" name="merkHp" required/>
                                    </Label>
                                </Col>
                                <Col span={12}>
                                <Label>
                                    IMEI:
                                    <Input type="text" placeholder="No Imei (*#06#)" name="imei"/>
                                </Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                <Label>
                                LOKASI:
                                    <Select placeholder="Lokasi" name="lokasi" required>
                                        <option value={'Cikaret'}>Cikaret</option>
                                        <option value={'Sukahati'}>Sukahati</option>
                                    </Select>
                                </Label>
                                </Col>
                                <Col span={12}>
                                    <Label>
                                        ESTIMASI HARGA:
                                        <Input type="number" placeholder="Masukan estimasi Harga" onChange={(e) => setHargaBaru(parseInt(e.target.value))} name="harga" required/>
                                    </Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Label>
                                        KERUSAKAN:
                                        <TextArea placeholder="Curhat Kerusakan User" name="keluhan" required/>
                                    </Label>
                                </Col>
                                <Col span={12}>
                                    <Label>
                                    PENERIMA:
                                        <Select placeholder="Penerima Service" value={UserName} name="penerima" required>
                                            <option>{UserName}</option>
                                        </Select>
                                    </Label>
                                </Col>
                            </Row>
                        <ButtonGroup>
                            <Buttons type="submit">SUBMIT</Buttons>
                        </ButtonGroup>
                        </Flex>
                    </Form>
            </FormCard>
            
        </>
    )

}

const ErrEvent = styled.div`
color: red;
`

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

const Label = styled.label`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const Input = styled(Inputs)`
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

    &:focus {
        background: rgb(var(--inputBackground));
    }
    &:hover {
        background: rgb(var(--inputBackground));
    }
    &::placeholder {
        color: rgb(var(--text));
    }
`;

const Buttons = styled(Button)`
margin: 0 auto;
`;

const Select = styled.select`
width: 13rem;
background: rgb(var(--inputBackground));
color: rgb(var(--text));
text-align: center;
border-radius: 12px;
border: none;
padding-top: 1rem;
`