"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function WhoAmIPage() {
    const supabase = createClient();
    const [status, setStatus] = useState("Loading...");

    useEffect(() => {
        (async () => {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                setStatus(`getSession error: ${sessionError.message}`);
                return;
            }

            const email = sessionData.session?.user?.email;
            const id = sessionData.session?.user?.id;

            if (!id) {
                setStatus("NO SESSION in browser (logged out).");
                return;
            }

            setStatus(`LOGGED IN ✅ ${email} (${id})`);
        })();
    }, [supabase]);

    return (
        <main style={{ padding: 24 }}>
            <h1>whoami</h1>
            <p>{status}</p>
        </main>
    );
}
