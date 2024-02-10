/* eslint-disable import/order */
import { useRouter } from "next/router"
import { useEffect } from "react"
import Cookies from "js-cookie";
import Button from "components/Button";

export default function Statistic() {
    const Auth:any = Cookies.get('_IDs')
    const route:any = useRouter();

    useEffect(() => {
        if(!Auth){
            alert('You Not Supposed to here before login ?')
            route.push('/')
        }
    }, [Auth, route])

    function Logout() {
        Cookies.remove('_IDs')
        route.push('/')
    }

    return(
        <>
        Statistic
            <Button onClick={(e) => Logout()}>LogOut</Button>
        </>
    )

}
