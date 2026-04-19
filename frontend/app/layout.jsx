export const metadata = {
    title: "Radar BR141",
    description: "Dashboard de conquistas Tribal Wars"
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
            </body>
        </html>
    );
}