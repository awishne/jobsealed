"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function TestUploadPage() {
    const supabase = createClient();
    const [email, setEmail] = useState<string | null>(null);
    const [msg, setMsg] = useState<string>("");

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getSession();
            setEmail(data.session?.user?.email ?? null);
        })();
    }, [supabase]);

    async function upload(file: File) {
        setMsg("");
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user) {
            setMsg("Not logged in. Go to /login first.");
            return;
        }

        const path = `${user.id}/test/${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("job-photos")
            .upload(path, file, { upsert: false });

        if (error) setMsg(`Upload error: ${error.message}`);
        else setMsg(`Uploaded ✅ ${path}`);
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Test Upload</h1>
            <p>{email ? `Logged in as ${email}` : "Not logged in"}</p>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(f);
                }}
            />

            <p style={{ marginTop: 12 }}>{msg}</p>
        </main>
    );
}
