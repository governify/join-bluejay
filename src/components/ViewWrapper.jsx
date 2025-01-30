import Navbar from './Navbar'

const ViewWrapper = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-2xl mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    )
}

export default ViewWrapper
