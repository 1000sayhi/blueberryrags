'use client';

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState,useEffect } from "react";

export default function NavBar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const goHome = () => {
        router.push('/')
    }
    
    const logoSrc = '/images/bbrFontLogo.png'
  
    const [isNavOpen,setIsNavOpen] = useState(false);

    const handleNav = () =>{
        setIsNavOpen(prev=>!prev)
    }
    useEffect(() => {
        setIsNavOpen(false);
      }, [pathname]);

    return (
        <>
            {isNavOpen && (<div className="overlay" onClick={() => setIsNavOpen(false)} />)}
            <div className={`side-nav ${isNavOpen ? 'open' : ''}`}>
                    {session?
                        <div className="upper-link-container">
                            <button className="logout-btn" onClick={()=>{signOut()}}>LOGOUT</button>
                            <Link href={'/cart'}>CART</Link>
                            <Link href={'/mypage'}>MY PAGE</Link>
                            <Link href={'/board'}>BOARD</Link>
                            {session.user.role === 'admin' && (
                                <Link href={'/itempost'}>POST ITEM</Link>
                            )}
                        </div>
                    :
                    <div className="upper-link-container">
                        <Link href={'/register'}>REGISTER</Link>
                        <Link href={'/login'}>LOGIN</Link>
                        <Link href={'/board'}>BOARD</Link>
                    </div>
                    }
                    
                    <div className="lower-link-container">
                        <Link href={'/intro'}>BlueBerry Rags </Link>
                        <Link href={'/category/all'}>ALL</Link>
                        <Link href={'/category/top'}>TOP</Link>
                        <Link href={'/category/bottom'}>BOTTOM</Link>
                        <Link href={'/category/shoes'}>SHOES</Link>
                        <Link href={'/category/etc'}>ETC</Link>
                    </div>
                </div>
                <button className="nav-icon-btn" >
                    <Image alt="" onClick={handleNav} className={`nav-icon ${isNavOpen ? 'icon-move' : ''}`} src="/images/blueberryimg.png" width={49} height={49} />
                </button>
            <div className="navbar">
                <div className="logo" onClick={goHome}>
                    <Image alt="logo" src={logoSrc} width={140} height={80} />
                </div>
            </div>
        </>
    )
}


