/* eslint-disable import/order */
import { Table as AntdTable, TableProps, Tag, } from "antd";
import styled from "styled-components";
import React, { ReactNode,} from "react";

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

const colors = ["geekblue", "green", "gold", "cyan", "magenta", "purple", "orange"];

const getColor = (index: number) => colors[index % colors.length];

const Columns: TableProps<DataRes>["columns"] = [
    {
        title: "NO NOTA",
        dataIndex: "NoNota",
        key: "NoNota",
        align: "center",
        width: 100,
        render: (_, {NoNota, Keluhan, NoHpUser, Lokasi, Penerima, MerkHp, NamaUser, Kerusakan}) => {
            const ConvertNumber = (noHP:string) => {
                if(noHP.startsWith('0')){
                    return '62' + noHP.slice(1);
                }
                return noHP
            }
            const noHpConverter = ConvertNumber(NoHpUser)

            return (
                <Tag color="volcano" style={{width: '100%', textAlign: 'start', fontWeight: 'bold'}}>
                    <a href={`https://wa.me/${noHpConverter}?text=Nota Services ${NoNota}, dibuat oleh ${
                        Lokasi === 'Cikaret' 
                        ? `CKRT-${Penerima}` 
                            : Lokasi === 'Sukahati' 
                            ? `SKHT-${Penerima}` 
                            : 'null'
                        }.%0A%0A Haii Ka ${NamaUser}, ini dari Glory Cell, mau infokan untuk handphone ${
                        MerkHp
                    } dengan kerusakan ${
                        Keluhan ? Keluhan : Kerusakan
                    } sudah selesai dan bisa diambil sekarang ya. Untuk Pengambilan Handphonenya dimohon bawa kembali nota servicenya ya kak, dan ini untuk invoicenya. Terimakasih%0A%0Ahttps://struk.rraf-project.site/struk?noNota=${NoNota}
                    %0A%0A *Glory Cell* %0A *Jl. Raya ${Lokasi === 'Cikaret' ? "Cikaret No 002B-C" : "Sukahati No 01"}* %0A *Hubungi kami lebih mudah, simpan nomor ini!* 08999081100 %0A *Follow IG Kami :* @glorycell.official 
                    `}
                    target="_blank">
                    {NoNota.toLocaleUpperCase()}
                    </a>
                </Tag>
            )

        }
    },
    {
        title: "LOKASI",
        dataIndex: "Lokasi",
        key: "Lokasi",
        width: 90,
        hidden: true,
        render: (_, { Lokasi, Keluhan }) => (
            <>
                <Tag style={Keluhan?.length > 100 ? {textAlign: 'left', width: '1330%', padding: '1rem', fontWeight: 'bold'} : {textAlign: 'left', width: '1330%', fontWeight: 'bold'}} color={Lokasi === 'Cikaret' ? 'geekblue' : 'volcano'}>{Lokasi.toLocaleUpperCase()}</Tag>
            </>
        ),
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
    {
        title: "Perbaikan",
        dataIndex: "Kerusakan",
        key: "Kerusakan",
        width: 350,
        hidden: true,
        align: "start",
        render: (_, {Kerusakan}) => (<div style={{textAlign: 'left', width: '100%', fontWeight: 'bold'}} color={'default'}>{Kerusakan?.toLocaleUpperCase() || 'null'}</div>),
    },
    {
    title: "SPAREPARTS",
    dataIndex: "sparepart",
    hidden: true,
    key: "sparepart",
    width: 700,
    align: "center",
    render: (_, { sparepart }) => (
        <WrapperExpandable2>
        {sparepart?.map((item, index) => {
            const color = getColor(index);
          return (
            <div key={`${item.Sparepart}-${index}`} style={{alignItems: 'center', textAlign: 'center', width: '100%'}}>
                <Tag color={color}>
                {item.Sparepart.toLocaleUpperCase()}({item.TypeOrColor})
                    Rp {parseInt(item.HargaSparepart).toLocaleString()}
                </Tag>
            </div>
          );
        })}
      </WrapperExpandable2>
    ),
  },
  {
      title: "HARGA USER",
      dataIndex: "Harga",
      hidden: true,
      key: "Harga",
    width: 101,
    align: 'center',
    render: (value) => `Rp${parseInt(value).toLocaleString()}`,
  },

  {
      title: "IMEI",
      dataIndex: "Imei",
      key: "Imei",
      align: 'center',
      hidden: true,
    },
    {
        title: "NAMA USER",
        dataIndex: "NamaUser",
        key: "NamaUser",
        ellipsis: true,
        hidden: true,
    },
    {
        title: "TEKNISI",
        dataIndex: "Teknisi",
        key: "Teknisi",
        ellipsis: true,
        hidden: true,
    },
    {
        title: "HARGA IBNU",
        dataIndex: 'HargaIbnu',
        key: "HargaIbnu",
        ellipsis: true,
        hidden: true,
        render: (text) => text ? `Rp ${parseInt(text).toLocaleString()}` : 'Rp 0',
    },
    {
        title: "PENERIMA",
        dataIndex: "Penerima",
        key: "Penerima",
        ellipsis: true,
        hidden: true,
    },

    {
        title: "TANGGAL KELUAR",
        dataIndex: "TglKeluar",
        key: "TglKeluar",
        align: "center",
        hidden: true,
        ellipsis: true,
        render: (text) => text ? (text === 'null' ? 'BELUM DIAMBIL' : dateFormater(text)) : 'BELUM DIAMBIL'
    },
    {
        title: "STATUS",
        dataIndex: "status",
        key: "status",
        ellipsis: true, 
        hidden: true,
        render: (status) => (
        <Tag color={status === "sukses" ? "green" : status === "process" ? 'yellow' : status === 'cancel' ? "red" : 'warning'}>{status}</Tag>
    ),
  },
];

interface TableComponentProps {
  data: DataRes[];
}

const TableModerator: React.FC<TableComponentProps> = ({ data }) => {
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
                        <Tag style={{display: 'flex'}} color={'default'}>LOKASI <div style={{marginLeft: '67px'}}>:</div> <div style={{marginLeft: '1%'}}> {record.Lokasi.toLocaleUpperCase()} </div></Tag>
                        <Tag style={{display: 'flex'}} color={'default'}>HARGA USER <div style={{marginLeft: '34px'}}>:</div> <div style={{marginLeft: '1%'}}>Rp {parseInt(record.Harga).toLocaleString('id-ID')}</div></Tag>
                        <Tag style={{display: 'flex'}} color={'default'}>IMEI <div style={{marginLeft: '83px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Imei.length > 5 ? `${record.Imei.slice(0, 4)}${'x'.repeat(record.Imei.length - 4)}` : "IMEI KOSONG"}</div></Tag>
                        <Tag style={{display: 'flex'}} color={'default'}>PERBAIKAN <div style={{marginLeft: '41px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Kerusakan ? record.Kerusakan.toLocaleUpperCase() : "BELUM DI PERBAIKI"}</div></Tag>
                        {record.sparepart ? <Tag style={{display: 'flex'}} color={'default'}>SPAREPARTS <div style={{marginLeft: '34px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.sparepart?.map((a, i) => {return (<Tag color={'volcano'} key={i}>{a.Sparepart}({a.TypeOrColor}) Rp {parseInt(a.HargaSparepart).toLocaleString('id-ID')}</Tag>)})}</div></Tag> : <></>}
                        <Tag style={{display: 'flex'}} color={'default'}>NAMA USER <div style={{marginLeft: '39px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.NamaUser?.toLocaleUpperCase()}</div></Tag>
                        <Tag style={{display: 'flex'}} color={'default'}>NO HP USER <div style={{marginLeft: '38px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.NoHpUser.length > 4 ? `${record.NoHpUser.slice(0,4)}${'x'.repeat(record.NoHpUser.length - 4)}` : "0"}</div></Tag>
                        {record.Teknisi ? <Tag style={{display: 'flex'}} color={'default'}>TEKNISI <div style={{marginLeft: '62px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Teknisi.toLocaleUpperCase()}</div></Tag> : <></> }
                        {record.Teknisi === 'Ibnu' ? <Tag style={{display: 'flex'}} color={'default'}>HARGA IBNU <div style={{marginLeft: '36px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.HargaIbnu ? `Rp ${parseInt(record.HargaIbnu).toLocaleString('id-ID')}` : 0} </div></Tag> : <></>}
                        <Tag style={{display: 'flex'}} color={'default'}>PENERIMA <div style={{marginLeft: '48px'}}>:</div> <div style={{marginLeft: '1%'}}>{record.Penerima?.toLocaleUpperCase()}</div></Tag>
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
                            <StyledRow status={record?.status || ""} tglKeluar={record?.TglKeluar || null} {...rest}>
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

const WrapperExpandable2 = styled.div`
display: flex; 
flex-direction: row;
font-weight: bold;
`;



const StyledRow = styled.tr<{ status: string; tglKeluar: string | null }>`
  background-color: ${({ status, tglKeluar }) => {
    if (status === "sukses" && tglKeluar === "null") return "#5EE7EC";
    if (status === "sukses") return "#12D200";
    if (status === "process") return "#EDE835";
    if (status === "process" && tglKeluar === 'null') return "#F57E7E";
    if (status === 'cancel' && tglKeluar === 'null') return "#E4B0B0";
    if (status === 'cancel') return "#DB3759";
    if (status === 'claim garansi') return "gray";
    if (status === 'garansi') return "gray";
    return "gray";
  }};
  font-size: 12px;
`;

export default TableModerator;
