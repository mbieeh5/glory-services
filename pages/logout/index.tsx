/* eslint-disable import/order */
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";

export default function Logout() {
    const route = useRouter();
    const auth = getAuth();
    
    useEffect(() => {
        Cookies.remove('_Sid');
        Cookies.remove('_Auth');
        Cookies.remove('_IDs');
        Cookies.remove('_theme');
        Cookies.remove('_uID');
        auth.signOut();
        route.push('/');
    },[auth, route])

    return(
        <>
            NULL
        </>
    )
}