'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
                    <h2>Bir hata oluştu</h2>
                    <p>İsteğiniz işlenirken beklenmedik bir durum gerçekleşti.</p>
                    <button
                        onClick={() => reset()}
                        style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}
                    >
                        Tekrar Dene
                    </button>
                </div>
            </body>
        </html>
    )
}
