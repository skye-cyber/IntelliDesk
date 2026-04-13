export const Loader = () => (
    <div id="loadingModal" className="fixed z-70 inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden">
        <div id="modalMainBox" className="bg-white p-6 rounded-lg shadow-lg flex gap-1 items-center animate-exit transition-all duration-1000">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p id="loadingMSG" className="mt-3 text-gray-700">Processing, please wait...</p>
        </div>
    </div>
)
