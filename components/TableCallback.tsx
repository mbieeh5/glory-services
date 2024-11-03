/* eslint-disable import/order */
import { Table as AntdTable, TableProps, Tag, } from "antd";
import styled from "styled-components";
import React, { ReactNode,} from "react";
import Swal from "sweetalert2";
import { getDatabase, ref, update } from "firebase/database";

interface DataRes {
  NoNota: string;
  NamaUser: string;
  NoHpUser: string;
  TglMasuk: string;
  TglKeluar: string;
  MerkHp: string;
  Kerusakan: string;
  Keluhan: string;
  Penerima: string;
  Harga: string;
  Imei: string;
  sparepart: SparepartData[];
  HargaIbnu: string;
  Teknisi: string;
  Lokasi: string;
  status: string;
  sudahDikabarin?: boolean;
}

interface SparepartData {
  Sparepart: string;
  HargaSparepart: string;
  TypeOrColor: string;
}

const dateFormater = (date:string) => {
    const TglObj = new Date(date);
    const tgl = TglObj.getDate();
    const bln = TglObj.getMonth() + 1;
    const thn = TglObj.getFullYear();
    const jam = TglObj.getHours();
    const mnt = TglObj.getMinutes();
    const tanggalWaktuBaru = ("0" + tgl).slice(-2) + "/" + ("0" + bln).slice(-2) + "/" + thn + " @" + ("0" + jam).slice(-2) + ":" + ("0" + mnt).slice(-2);
    if(!isNaN(tgl)){
        return tanggalWaktuBaru
    }else{
        return 'Belum Di Ambil'
    }
}


const Columns: TableProps<DataRes>["columns"] = [
    {
        title: "NO NOTA",
        dataIndex: "NoNota",
        key: "NoNota",
        align: "center",
        width: 100,
        render: (_, {NoNota, NoHpUser }) => {
            const ConvertNumber = (noHP:string) => {
                if(noHP.startsWith('0')){
                    return '62' + noHP.slice(1);
                }
                return noHP
            }
            const noHpConverter = ConvertNumber(NoHpUser)
            const notaRef = ref(getDatabase(), `Service/sandboxDS/${NoNota}`);

            const handleWhatsappClick = () => {
                Swal.fire({
                    title: 'Apakah Kamu Sudah Kirim Pesan ?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sudah Di Kirim',
                    cancelButtonText: 'Belum Di Kirim',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#3095d6',
                }).then((result) => {
                    if(result.isConfirmed) {
                        update(notaRef, {sudahDikabarin: true})
                        Swal.fire(
                            'Status Berhasil Di Perbaharui',
                            'Status: Sudah Di Kirim',
                            'success'
                        );
                    }else {
                        update(notaRef, {sudahDikabarin: true})
                        window.open(`https://wa.me/${noHpConverter}?text=Pelanggan Yth, Terimakasih telah mempercayakan Service Handphone anda kepada GloryCell.
                        Kami ingin tau perkembangan dari perbaikan yang kami lakukan, Sebagai bentuk Pelayanan dari kami jika ada keluhan, silahkan hubungi kami kembali.%0A
                        Simpan nomor kami untuk bantuan instan dan informasi penting seputar produk dan layanan langsung di chat Anda!`, "_blank");
                        
                           Swal.fire(
                               'Pesan Terkirim!',
                               'Status: Sudah Di Kirim',
                               'success'
                    );
                    }
                })
            }

            return (
                <Tag onClick={handleWhatsappClick} color="purple" style={{width: '100%', textAlign: 'start', fontWeight: 'bold'}}>
                    {NoNota.toLocaleUpperCase()}
                </Tag>
            )

        }
    },
    {
        title: "TANGGAL MASUK",
        dataIndex: "TglMasuk",
        key: "TglMasuk",
        width: 145,
        align: "center",
        render: (_, {TglMasuk}) => (
            <div style={{ width: '100%', fontWeight: 'bold'}} color={'green'}>{dateFormater(TglMasuk)}</div>
        ),
    },
    {
        title: "MEREK HP",
    dataIndex: "MerkHp",
    key: "MerkHp",
    width: 165,  
    align: "center",
    render: (_, {MerkHp}) =>( <div style={{textAlign: 'left', width: '100%', fontWeight: 'bold'}} color={'default'}>{MerkHp.toLocaleUpperCase()}</div>),
    },
    {
        title: "KERUSAKAN",
        dataIndex: "Keluhan",
        key: "Keluhan",
        width: 600,
        align: "start",
        render: (_, {Keluhan}) => (<div style={{textAlign: 'left', width: '100%', fontWeight: 'bold'}} color={'default'}>{Keluhan?.toLocaleUpperCase()}</div>),
    },
];

interface TableComponentProps {
  data: DataRes[];
}

const TableCallback: React.FC<TableComponentProps> = ({ data }) => {
    return (
        <>
            <StyledAntTable
            columns={Columns} 
            dataSource={data} 
            rowKey="NoNota"
            size={"small"}
            pagination={false}
            scroll={{ x: 0 , y: 130 * 5 }}
            expandable={{
                expandedRowRender: (record) => 
                    <WrapperExpandable status={record?.status || ""} tglKeluar={record?.TglKeluar || null}>
                        <Tag style={{display: 'flex'}} color={'default'}>NO NOTA <div style={{marginLeft: '56px'}}>:</div> <div style={{marginLeft: '1%'}}> {record.NoNota} </div></Tag>
                        <Tag style={{display: 'flex'}} color={'default'}>TANGGAL KELUAR <div style={{marginLeft: '6px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.TglKeluar ? dateFormater(record.TglKeluar) : "BELUM DI AMBIL"}</div></Tag>
                        <Tag style={{display: 'flex'}} color={record.status === 'sukses' ? 'green-inverse' : record.status === 'process' ? 'gold-inverse' : 'volcano-inverse'}>{record.status.toLocaleUpperCase()}</Tag>
                    </WrapperExpandable>
            }}
            components={{
                body: 
                {
                    row: (props: { children: ReactNode; "data-row-key" ?: string}) => {
                        const {children, ...rest} = props;
                        const record = rest["data-row-key"] ? data.find((d) => d.NoNota === rest["data-row-key"]) : undefined
                        return (
                            <StyledRow status={record?.status || ""} sudahDikabarin={record?.sudahDikabarin || null} {...rest}>
                                {children}
                            </StyledRow>
                            );
                        },
                },  
            }}
            />
        </>
        )
};

const StyledAntTable = styled(AntdTable<DataRes>)`
padding: 1rem;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
border-radius: 8px;

.ant-table-thead .ant-table-cell {
    background-color: gray;
    color: white;
  }

  .ant-table-header th {
    font-weight: bold;
    border-bottom: 2px solid #1890ff; 
  }
`

const WrapperExpandable = styled.div<{status: string, tglKeluar: string | null}>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: rgb(var(--text));
  font-weight: bold;
  width: 100%;
`;

const StyledRow = styled.tr<{ status: string; sudahDikabarin: boolean | null }>`
  background-color: ${({ status, sudahDikabarin }) => {
    if (status === "belum dikabarin" && sudahDikabarin === false) return "#B99FF8";
    if (sudahDikabarin === true) return `#12D200`;
    return "#B99FF8";
  }};
  font-size: 12px;
`;

export default TableCallback;
