/* eslint-disable import/order */
import React from "react";
import styled from "styled-components";
import {  CartesianGrid, Legend, Line, LineChart,  ReferenceLine , ResponsiveContainer, Tooltip, XAxis , YAxis} from 'recharts';
import BasicSection from "components/BasicSection";



export default function Statistics({Data, TotalU, TotalP}:any) {
    
    return(
        <>
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
                            <ReferenceLine y={25} label="Minimal Redeem 25 units" stroke="red" strokeDasharray="6 6" />
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
                        <ReferenceLine y={250000} label="Min 250.000 points" stroke="red" strokeDasharray="6 6" />
                        </LineChart>
                    </ResponsiveContainer>
        </>
    )
}

const UL = styled.ul`
font-size: 2rem;
padding-bottom: 1rem;
`