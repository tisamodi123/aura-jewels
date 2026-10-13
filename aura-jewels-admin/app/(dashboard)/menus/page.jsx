"use client";

import MenuBuilder from "./_components/MenuBuilder";
import { MENU_LOCATION } from "@/lib/Constant";

export default function MenusPage() {
    return (
        <div className="p-4">
            <MenuBuilder location={MENU_LOCATION.HEADER} />
        </div>
    );
}
