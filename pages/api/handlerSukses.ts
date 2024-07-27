import { NextApiRequest, NextApiResponse } from "next";

export default function handler(res:NextApiResponse, req:NextApiRequest) {
    if(req.method === 'POST'){
        
    }else{
        res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
}