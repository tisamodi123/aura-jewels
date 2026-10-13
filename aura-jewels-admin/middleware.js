import { NextResponse } from "next/server";

export async function middleware(req){

    // const url = req.nextUrl.clone();
    // const pudblicPaths = ["/login"];
    // const cookieStore = await cookies();
    // const token = cookieStore?.get("token")?.value;

    // if(token){
    //     if(url.pathname == '/login'){
    //         url.pathname = "/dashboard"
    //         return NextResponse.redirect(url); 
    //     }

    //     if(url.pathname == '/'){
    //         url.pathname = "/dashboard"
    //         return NextResponse.redirect(url); 
    //     }

    // }else{
    //     if(url.pathname == '/'){
    //         url.pathname = "/dashboard"
    //         return NextResponse.redirect(url); 
    //     }

    //     if(!pudblicPaths.includes(url.pathname)){
    //         url.pathname = "/login"
    //         return NextResponse.redirect(url); 
    //     }
    // }    

    return NextResponse.next();
}


// export const config = {
//     matcher: [
//       "/",
//       "/login",
//       "/dashboard",
//       "/paratype",
//     ],
// };
  